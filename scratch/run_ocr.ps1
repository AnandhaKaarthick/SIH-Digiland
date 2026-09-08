$lang = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]::new("en-US")
$engine = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]::TryCreateFromLanguage($lang)

for ($p=1; $p -le 5; $p++) {
    $files = Get-ChildItem -Path "scratch" -Filter "page_${p}_Obj*.jpg"
    if ($files) {
        $filePath = $files[0].FullName
        $fileTask = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]::GetFileFromPathAsync($filePath)
        while (-not $fileTask.IsCompleted) { Start-Sleep -Milliseconds 50 }
        $file = $fileTask.GetResults()

        $streamTask = $file.OpenAsync([Windows.Storage.FileAccessMode, Windows.Storage, ContentType = WindowsRuntime]::Read)
        while (-not $streamTask.IsCompleted) { Start-Sleep -Milliseconds 50 }
        $stream = $streamTask.GetResults()

        $decoderTask = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]::CreateAsync($stream)
        while (-not $decoderTask.IsCompleted) { Start-Sleep -Milliseconds 50 }
        $decoder = $decoderTask.GetResults()

        $bmpTask = $decoder.GetSoftwareBitmapAsync()
        while (-not $bmpTask.IsCompleted) { Start-Sleep -Milliseconds 50 }
        $bmp = $bmpTask.GetResults()

        $ocrTask = $engine.RecognizeAsync($bmp)
        while (-not $ocrTask.IsCompleted) { Start-Sleep -Milliseconds 50 }
        $result = $ocrTask.GetResults()

        Write-Host "=================== PAGE $p OCR TEXT ==================="
        Write-Host $result.Text
    }
}
