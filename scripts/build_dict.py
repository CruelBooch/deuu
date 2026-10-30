# -*- coding: utf-8 -*-
"""
从 zhwiktionary 的 pages-articles dump 中提取德语词条，生成紧凑离线词典。

用法:
  python build_dict.py <dump.bz2> <out.jsonl> [--limit N]

输出每行一个 JSON:
  {"w":"Haus","p":"名词","g":"das","pl":"Häuser","ipa":"/haʊ̯s/","d":["房子、住房"]}
"""
import bz2
import json
import re
import sys

from lxml import etree

try:
    from opencc import OpenCC

    _T2S = OpenCC('t2s')
except Exception:
    _T2S = None

GERMAN_HEADING_RE = re.compile(r'^==\s*(德语|德語)\s*==\s*$', re.M)
LEVEL2_RE = re.compile(r'^==\s*[^=].*?==\s*$', re.M)
LEVEL3_RE = re.compile(r'^===\s*(.+?)\s*===\s*$', re.M)

POS_MAP = {
    '名詞': '名词', '名词': '名词',
    '動詞': '动词', '动词': '动词',
    '形容詞': '形容词', '形容词': '形容词',
    '副詞': '副词', '副词': '副词',
    '代詞': '代词', '代词': '代词',
    '介詞': '介词', '介词': '介词',
    '連詞': '连词', '连词': '连词',
    '感嘆詞': '感叹词', '感叹词': '感叹词',
    '數詞': '数词', '数词': '数词',
    '冠詞': '冠词', '冠词': '冠词',
    '縮寫': '缩写', '缩写': '缩写',
    '專有名詞': '专有名词', '专有名词': '专有名词',
    '短語': '短语', '短语': '短语',
    '詞綴': '词缀', '词缀': '词缀',
    '前綴': '前缀', '前缀': '前缀',
    '後綴': '后缀', '后缀': '后缀',
    '助詞': '助词', '助词': '助词',
    '語氣詞': '语气词', '语气词': '语气词',
    '代名詞': '代词', '代名词': '代词',
}

TEMPLATE_RE = re.compile(r'\{\{[^{}]*\}\}')
LINK_PIPE_RE = re.compile(r'\[\[([^\]|]*)\|([^\]]*)\]\]')
LINK_RE = re.compile(r'\[\[([^\]]*)\]\]')
REF_RE = re.compile(r'<ref[^>]*>.*?</ref>', re.S)
REF_SELF_RE = re.compile(r'<ref[^>]*/>')
COMMENT_RE = re.compile(r'<!--.*?-->', re.S)
HTML_RE = re.compile(r'<[^>]+>')
BOLD_RE = re.compile(r"'{2,5}")
EXT_LINK_RE = re.compile(r'\[https?://[^\]]*\]')
SPACE_RE = re.compile(r'\s+')

UMLAUT = {'a': 'ä', 'o': 'ö', 'u': 'ü', 'A': 'Ä', 'O': 'Ö', 'U': 'Ü'}


def umlaut(stem: str) -> str:
    for i, ch in enumerate(stem):
        if ch in 'aouAOU':
            if stem[i:i + 2].lower() == 'au':
                return stem[:i] + ('Äu' if ch.isupper() else 'äu') + stem[i + 2:]
            return stem[:i] + UMLAUT[ch] + stem[i + 1:]
    return stem


def build_plural(word: str, raw: str) -> str:
    """德语维基的复数参数可能是词尾后缀（e/en/er），也可能是完整复数（Frauen）。"""
    raw = (raw or '').strip()
    if not raw:
        return ''
    if raw.startswith('^'):
        return umlaut(word) + raw[1:]
    if len(raw) <= 3:
        return word + raw
    return raw


def clean_wiki(s: str) -> str:
    s = COMMENT_RE.sub('', s)
    s = REF_SELF_RE.sub('', s)
    s = REF_RE.sub('', s)
    s = HTML_RE.sub('', s)
    prev = None
    while prev != s:
        prev = s
        s = TEMPLATE_RE.sub('', s)
    s = LINK_PIPE_RE.sub(r'\2', s)
    s = LINK_RE.sub(r'\1', s)
    s = BOLD_RE.sub('', s)
    s = EXT_LINK_RE.sub('', s)
    s = s.replace('&nbsp;', ' ').replace('&amp;', '&')
    s = SPACE_RE.sub(' ', s).strip()
    s = s.strip(' ，、;；,.')
    if _T2S is not None and s:
        s = _T2S.convert(s)
    return s


def german_section(text: str):
    m = GERMAN_HEADING_RE.search(text)
    if not m:
        return None
    rest = text[m.end():]
    m2 = LEVEL2_RE.search(rest)
    return rest[:m2.start()] if m2 else rest


def split_subsections(section: str):
    parts = []
    heading = None
    lines = []
    for line in section.split('\n'):
        m = LEVEL3_RE.match(line.strip())
        if m:
            if heading is not None:
                parts.append((heading, lines))
            heading = m.group(1).strip()
            lines = []
        else:
            lines.append(line)
    if heading is not None:
        parts.append((heading, lines))
    return parts


def extract_defs(lines):
    defs = []
    for line in lines:
        t = line.strip()
        if not t.startswith('#'):
            continue
        if t.startswith('#:') or t.startswith('#*') or t.startswith('#;') or t.startswith('#!'):
            continue
        d = clean_wiki(t[1:].strip())
        if d and d not in defs:
            defs.append(d)
    return defs[:6]


def extract_ipa(text: str):
    for m in re.finditer(r'\{\{\s*IPA\s*\|([^}]*)\}\}', text, re.I):
        for part in m.group(1).split('|'):
            p = part.strip()
            if p.startswith('/') or p.startswith('['):
                return p
    return None


def find_template_args(text: str, name: str):
    pattern = re.compile(
        r'\{\{\s*' + re.escape(name) + r'\s*\|((?:[^{}]|\{\{[^{}]*\}\})*)\}\}', re.I
    )
    m = pattern.search(text)
    return m.group(1) if m else None


def clean_plural(raw: str) -> str:
    if not raw:
        return ''
    s = raw.strip()
    if not s or s.startswith('.') or s.startswith('-'):
        return ''
    for sep in (':', ';', ',', '/'):
        if sep in s:
            s = s.split(sep)[0].strip()
    if s == '^':
        return '^'
    if not re.fullmatch(r'\^?[A-Za-zÄÖÜäöüß]+', s):
        return ''
    return s


def extract_noun_info(section: str, word: str):
    raw = find_template_args(section, 'de-noun')
    if not raw:
        return None, None
    tokens = [t.strip() for t in raw.split('|')]
    first = tokens[0] if tokens else ''
    if ',' in first:
        parts = [p.strip() for p in first.split(',')]
        g = parts[0] if parts else ''
        pl_raw = parts[2] if len(parts) >= 3 else ''
    else:
        g = first
        pl_raw = tokens[2] if len(tokens) >= 3 else ''
    gender = {'m': 'der', 'f': 'die', 'n': 'das'}.get(g)
    pl = clean_plural(pl_raw)
    plural = build_plural(word, pl) if pl else None
    return gender, plural


def child_text(elem, name):
    for c in elem:
        if c.tag.rsplit('}', 1)[-1] == name:
            return c.text
    return None


def page_text(elem):
    for c in elem:
        if c.tag.rsplit('}', 1)[-1] == 'revision':
            for cc in c:
                if cc.tag.rsplit('}', 1)[-1] == 'text':
                    return cc.text
    return None


def main():
    src = sys.argv[1]
    out = sys.argv[2]
    limit = 0
    if '--limit' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--limit') + 1])

    part = out + '.part'
    total_pages = 0
    german_pages = 0
    written = 0
    with bz2.open(src, 'rb') as f, open(part, 'w', encoding='utf-8') as w:
        for _, elem in etree.iterparse(f, events=('end',)):
            if not elem.tag.endswith('page'):
                continue
            total_pages += 1
            if total_pages % 50000 == 0:
                print(f'... scanned {total_pages} pages, written {written}', flush=True)
            if limit and total_pages > limit:
                break

            title = (child_text(elem, 'title') or '').strip()
            text = page_text(elem)
            elem.clear()
            while elem.getprevious() is not None:
                del elem.getparent()[0]

            if not title or not text or ':' in title:
                continue

            section = german_section(text)
            if not section:
                continue
            german_pages += 1

            ipa = extract_ipa(section)
            gender, plural = extract_noun_info(section, title)

            entries = []
            for heading, lines in split_subsections(section):
                pos = POS_MAP.get(heading)
                if not pos:
                    continue
                defs = extract_defs(lines)
                if not defs:
                    continue
                entry = {'w': title, 'p': pos}
                if gender and pos == '名词':
                    entry['g'] = gender
                if plural and pos == '名词':
                    entry['pl'] = plural
                if ipa:
                    entry['ipa'] = ipa
                entry['d'] = defs
                entries.append(entry)

            if not entries:
                continue
            for e in entries:
                w.write(json.dumps(e, ensure_ascii=False) + '\n')
                written += 1

    print(f'pages={total_pages} german_pages={german_pages} entries={written}')
    import os
    os.replace(part, out)
    print(f'written to {out}')


if __name__ == '__main__':
    main()
