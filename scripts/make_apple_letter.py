"""生成《关于申请以学校名义注册 Apple 开发者账号并办理会费豁免的请示》"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = r"D:\workspace\deu\docs\Apple开发者账号-申请书.docx"

doc = Document()

# ---------- 页面 ----------
sec = doc.sections[0]
sec.page_width = Cm(21.0)      # A4
sec.page_height = Cm(29.7)
sec.top_margin = Cm(2.2)
sec.bottom_margin = Cm(2.2)
sec.left_margin = Cm(3.0)
sec.right_margin = Cm(2.6)

# ---------- 默认样式 ----------
normal = doc.styles["Normal"]
normal.font.name = "宋体"
normal.font.size = Pt(12)
normal.element.rPr.rFonts.set(qn("w:eastAsia"), "宋体")


def run_font(run, name="宋体", size=12, bold=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.bold = bold
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    if color:
        run.font.color.rgb = RGBColor(*color)


def para(text="", *, indent=True, size=12, font="宋体", bold=False,
         align=None, space_after=3, line=1.35, space_before=0):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.first_line_indent = Pt(size * 2) if indent else Pt(0)
    pf.space_after = Pt(space_after)
    pf.space_before = Pt(space_before)
    pf.line_spacing = line
    if align is not None:
        p.alignment = align
    if text:
        run_font(p.add_run(text), font, size, bold)
    return p


def heading(text):
    return para(text, indent=False, size=12, font="黑体", bold=True,
                space_before=8, space_after=3)


def table(rows, widths):
    t = doc.add_table(rows=len(rows), cols=len(rows[0]))
    t.style = "Table Grid"
    t.autofit = False
    # 跨页时重复表头，且行内不拆分
    for idx, row in enumerate(t.rows):
        trPr = row._tr.get_or_add_trPr()
        cant = OxmlElement("w:cantSplit")
        trPr.append(cant)
        if idx == 0:
            th = OxmlElement("w:tblHeader")
            th.set(qn("w:val"), "true")
            trPr.append(th)
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            cell = t.cell(i, j)
            cell.width = Cm(widths[j])
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.line_spacing = 1.05
            run_font(p.add_run(val), "宋体", 10.5, bold=(i == 0))
    return t


# ---------- 标题 ----------
para("关于申请以学校名义注册 Apple 开发者账号\n并办理会费豁免的请示",
     indent=False, size=18, font="黑体", bold=True,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12, line=1.35)

para("尊敬的校领导、信息中心（教务处）：",
     indent=False, size=12, space_after=6)

para("我是 ×× 年级 ×× 班学生 ×××，正在学习德语。为解决同学们“查词慢、句子看不懂、"
     "缺少语法讲解”的实际困难，我利用课余时间自主开发了一款德语学习辅助工具 deuu，"
     "目前已在部分班级的德语学习中免费使用。现将有关情况汇报如下，并申请以学校名义"
     "注册开发者账号，以便为使用 iPhone、iPad 的同学提供完整版本。")

heading("一、开发背景")
para("在动手开发之前，我检索并试用了一些现有的德语查询工具，发现普遍存在以下不足：")
for item in [
    "免费版本多带广告，或不提供完整功能，完整使用需订阅付费；",
    "中文释义较为简略，词性、名词的性、复数形式、音标等基础信息不全；",
    "多数需要联网使用，教室或自习室网络不稳定时无法查词；",
    "只给出译文，缺少针对整句的语法讲解，初学者难以真正理解。",
]:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Pt(24)
    p.paragraph_format.first_line_indent = Pt(-12)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.35
    run_font(p.add_run("· " + item), "宋体", 12)
para("基于以上原因，我利用课余时间开发了本应用，重点解决“完全免费、可离线、释义完整”三个问题。"
     "相较于现有的同类工具，本应用的主要特点如下：", space_before=4)

heading("二、项目基本情况")
table(
    [
        ["项目", "内容"],
        ["应用名称", "deuu（德语学习辅助工具）"],
        ["主要功能", "单词释义查询（内置约 2 万词离线词库）、整句翻译与语法讲解、生词本管理"],
        ["使用对象", "本校德语学习者及德语教师"],
        ["收费情况", "完全免费，无广告、无内购、无任何商业收益"],
        ["运行平台", "Windows（已发布）、Android（已发布）、网页版（已搭建）"],
    ],
    [2.6, 12.8],
)

heading("三、当前进展")
para("本应用于 ×× 年 ×× 月起在 ×× 个班级试用，累计使用约 ××× 人次。教师可用其快速"
     "准备例句与词汇讲解；学生可离线查词，不依赖网络。")
para("对于使用 iPhone、iPad 的同学，目前只能通过网页访问，体验不如原生应用。"
     "按苹果公司规定，向 iOS 用户正式发布应用须通过 App Store，并需注册 "
     "Apple Developer Program 账号。")

heading("四、遇到的困难")
para("Apple Developer Program 个人账号年费为 99 美元（约合人民币 700 元），且需每年续费。"
     "作为在校学生，我无力承担该费用，也不宜以个人名义长期承担面向全校的发布责任。")
para("经查阅苹果公司官方政策：《Apple Developer Program 会费豁免》明确规定，非营利组织、"
     "经认证的教育机构及政府机构可申请免除该项年费。学校作为教育机构，符合申请条件"
     "（政策原文见附件，苹果官网可查：developer.apple.com/cn/help/account/membership/fee-waivers）。")

heading("五、申请事项")
for item in [
    "请学校同意以学校名义注册 Apple Developer Program 组织账号，作为本应用的发布主体；",
    "请学校安排相关部门（信息中心 / 教务处）配合准备 D-U-N-S 编码、机构证明等材料，"
    "并向苹果公司提交会费豁免申请（该申请本身不产生任何费用）；",
    "请学校同意本人以团队成员（Developer 角色）身份，负责该账号下的应用开发、上传与更新；",
    "请学校指定部门对本应用的内容进行审核与监督。",
]:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Pt(24)
    p.paragraph_format.first_line_indent = Pt(-12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.35
    run_font(p.add_run("· " + item), "宋体", 12)

heading("六、分工与承诺")
para("本人承诺承担全部技术与维护工作，不向学校申请任何经费：")
for item in [
    "负责应用的设计、开发、测试、更新与技术支持；",
    "向学校交付完整源代码及技术文档，供学校备份与审查；",
    "配合学校开展内容审核与合规检查；",
    "应用内不出现校名、校徽等学校标识（除非获得书面授权）；如学校认为存在风险或决定终止，"
    "本人无条件配合下架，不提出任何异议；",
    "毕业前完成维护交接，包括源代码、发布操作说明与文档。",
]:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Pt(24)
    p.paragraph_format.first_line_indent = Pt(-12)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.35
    run_font(p.add_run("· " + item), "宋体", 12)

para("学校方面仅需：作为账号主体完成注册与豁免申请、对内容进行审核把关、"
     "并保留监督与终止的权利。", space_before=4)

heading("七、风险说明与应对")
table(
    [
        ["风险点", "说明与本方案"],
        ["个人信息安全", "不收集任何个人身份信息，不申请通讯录、定位、相机等权限；"
                   "查询记录与生词本仅保存在用户本机"],
        ["内容合规", "应用为德语学习工具，无社交、无广告、无用户生成内容；"
                 "翻译功能由用户自行配置第三方 AI 接口，应用内会明确提示数据流向"],
        ["第三方 AI 服务", "仅发送用户主动输入、待翻译的文本，不发送任何身份信息"],
        ["备案要求", "当前仅通过校内渠道分发，不进入国内应用商店；若后续需在国内应用商店上架，"
                 "本人将配合准备 APP 备案材料，是否办理由学校决定"],
        ["责任归属", "应用以学校名义发布，学校保留全部监督权与下架权"],
    ],
    [3.2, 12.2],
)

heading("八、结语")
para("本应用源于课堂需求，已在同学中实际使用并取得一定效果。恳请学校予以支持。"
     "如需现场演示、查看源代码或补充任何材料，我随时可以提供。")

para("此致", indent=True, space_before=8, space_after=2)
para("敬礼！", indent=False, space_after=16)

for line in ["申请人：×××（×× 年级 ×× 班）", "联系电话：______________",
             "电子邮箱：______________", "日　　期：2026 年 ____ 月 ____ 日"]:
    para(line, indent=False, align=WD_ALIGN_PARAGRAPH.RIGHT, space_after=2)

att = para("附件：", indent=False, font="黑体", size=12, bold=True, space_before=8, space_after=2)
att.paragraph_format.keep_with_next = True
for i, item in enumerate([
    "应用功能截图（Windows / Android / 网页版）",
    "源代码与技术文档清单",
    "隐私说明（数据仅保存于本机）",
    "苹果公司会费豁免政策页面打印件",
], 1):
    para(f"{i}. {item}", indent=False, size=10, space_after=0, line=1.2)

doc.save(OUT)
print("saved:", OUT)




