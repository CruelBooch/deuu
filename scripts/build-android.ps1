# deuu · Android APK 一键构建
# 前提: 先跑过 scripts/setup-android.ps1
# 用法: Invoke-Expression (Get-Content scripts/build-android.ps1 -Raw -Encoding UTF8)

$ErrorActionPreference = 'Continue'
$root = 'D:\workspace\deu'
$env:JAVA_HOME = 'D:\Android\jdk-17'
$env:ANDROID_HOME = 'D:\Android\sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

$node = 'C:\Users\CZYLI\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path $node)) { $node = 'node' }

function Step($m) { Write-Host "`n[android] $m" -ForegroundColor Cyan }

if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) { throw "未找到 JDK，请先运行 scripts/setup-android.ps1" }
if (-not (Test-Path "$env:ANDROID_HOME\platforms")) { throw "未找到 Android SDK，请先运行 scripts/setup-android.ps1" }

Step '1/4 构建 web 资源'
Set-Location $root
& $node "$root\node_modules\electron-vite\bin\electron-vite.js" build
if ($LASTEXITCODE -ne 0) { throw 'web 构建失败' }

Step '2/4 同步到 Android 工程'
& $node "$root\node_modules\@capacitor\cli\bin\capacitor" sync android
if ($LASTEXITCODE -ne 0) { throw 'cap sync 失败' }

Step '3/4 Gradle 构建 release APK'
Set-Location "$root\android"
$gradleBin = 'D:\Android\gradle-8.2.1\bin\gradle.bat'
if (Test-Path $gradleBin) {
  & $gradleBin assembleRelease --no-daemon --console=plain
} else {
  & .\gradlew.bat assembleRelease
}
if ($LASTEXITCODE -ne 0) { throw 'Gradle 构建失败' }

Step '4/4 复制产物'
$apk = "$root\android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) { throw "未找到 APK: $apk" }
New-Item -ItemType Directory -Path "$root\release" -Force | Out-Null
Copy-Item -LiteralPath $apk -Destination "$root\release\deuu-0.1.0.apk" -Force
$size = [math]::Round((Get-Item "$root\release\deuu-0.1.0.apk").Length / 1MB, 1)
Write-Host "[android] 完成 -> release\deuu-0.1.0.apk ($size MB)" -ForegroundColor Green
