# deuu · Android 构建环境一键安装（Windows）
# 用法: Invoke-Expression (Get-Content scripts/setup-android.ps1 -Raw -Encoding UTF8)
# 说明: 安装到 D:\Android（工作区之外），可重复执行，已存在的会跳过。

$ErrorActionPreference = 'Continue'
$root = 'D:\Android'
$jdkDir = "$root\jdk-17"
$sdkRoot = "$root\sdk"
$jdkUrl = 'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/17/jdk/x64/windows/OpenJDK17U-jdk_x64_windows_hotspot_17.0.20.1_1.zip'
$cmdlineUrl = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip'

function Step($msg) { Write-Host "`n[setup] $msg" -ForegroundColor Cyan }
function Fail($msg) { throw "[setup] $msg" }

function Download($url, $dest) {
  if (Test-Path -LiteralPath $dest) { return }
  & curl.exe -L --fail --retry 3 -sS -o $dest $url 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $dest)) {
    Remove-Item -LiteralPath $dest -Force -ErrorAction SilentlyContinue
    Fail "下载失败: $url"
  }
}

New-Item -ItemType Directory -Path $root -Force | Out-Null

# ---------- JDK 17 ----------
if (Test-Path "$jdkDir\bin\java.exe") {
  Step "JDK 已存在，跳过"
} else {
  Step "下载 JDK 17 (Temurin, 清华镜像)"
  Download $jdkUrl "$root\jdk17.zip"
  Step "解压 JDK"
  Expand-Archive -LiteralPath "$root\jdk17.zip" -DestinationPath "$root\jdk_tmp" -Force
  $inner = Get-ChildItem "$root\jdk_tmp" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $inner) { Fail "JDK 解压结构异常" }
  Move-Item -LiteralPath $inner.FullName -Destination $jdkDir -Force
  Remove-Item -LiteralPath "$root\jdk_tmp" -Recurse -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path "$jdkDir\bin\java.exe")) { Fail "JDK 安装失败" }
}
$javaVer = (& "$jdkDir\bin\java.exe" -version 2>&1 | Out-String).Trim()
Write-Host "[setup] JDK: $($javaVer.Split("`n")[0])"

# ---------- Android SDK cmdline-tools ----------
$sdkmanager = "$sdkRoot\cmdline-tools\latest\bin\sdkmanager.bat"
if (Test-Path $sdkmanager) {
  Step "cmdline-tools 已存在，跳过"
} else {
  Step "下载 Android cmdline-tools"
  Download $cmdlineUrl "$root\cmdline.zip"
  Step "解压 cmdline-tools"
  Expand-Archive -LiteralPath "$root\cmdline.zip" -DestinationPath "$root\cl_tmp" -Force
  New-Item -ItemType Directory -Path "$sdkRoot\cmdline-tools" -Force | Out-Null
  Move-Item -LiteralPath "$root\cl_tmp\cmdline-tools" -Destination "$sdkRoot\cmdline-tools\latest" -Force
  Remove-Item -LiteralPath "$root\cl_tmp" -Recurse -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path $sdkmanager)) { Fail "cmdline-tools 安装失败" }
}

$env:JAVA_HOME = $jdkDir
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:Path = "$jdkDir\bin;$sdkRoot\cmdline-tools\latest\bin;$sdkRoot\platform-tools;$env:Path"

# ---------- 接受许可 ----------
Step "接受 Android SDK 许可"
$y = ("y`r`n" * 80)
$y | & $sdkmanager --sdk_root=$sdkRoot --licenses 2>&1 | Out-Null
Write-Host "[setup] licenses exit=$LASTEXITCODE"

# ---------- 安装必要组件 ----------
Step "安装 platform-tools / platform-34 / build-tools 34"
& $sdkmanager --sdk_root=$sdkRoot "platform-tools" "platforms;android-34" "build-tools;34.0.0" 2>&1 | Select-Object -Last 10 | Out-String | Write-Host
if ($LASTEXITCODE -ne 0) { Fail "SDK 组件安装失败 (exit $LASTEXITCODE)" }

Step "完成"
Write-Host "JAVA_HOME    = $jdkDir"
Write-Host "ANDROID_HOME = $sdkRoot"
Get-ChildItem $sdkRoot -Directory -ErrorAction SilentlyContinue | Select-Object Name | Format-Table -AutoSize
