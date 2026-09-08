$lang = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]::new("en-US")
$engine = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]::TryCreateFromLanguage($lang)

for ($i=1; $i -le 3; $i++) {
    $files = Get-ChildItem -Path "scratch" -Filter "page_${i}_Obj*.jpg"
    if ($files) {
        $path = $files[0].FullName
        $fileAsync = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]::GetFileFromPathAsync($path)
        while ($fileAsync.Status -eq 'Started') { Start-Sleep -Milliseconds 20 }
        $file = $fileAsync.GetResults()

        $streamAsync = $file.OpenAsync([Windows.Storage.FileAccessMode, Windows.Storage, ContentType = WindowsRuntime]::Read)
        while ($streamAsync.Status -eq 'Started') { Start-Sleep -Milliseconds 20 }
        $stream = $streamAsync.GetResults()

        $decoderAsync = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]::CreateAsync($stream)
        while ($decoderAsync.Status -eq 'Started') { Start-Sleep -Milliseconds 20 }
        $decoder = $decoderAsync.GetResults()

        $bmpAsync = $decoder.GetSoftwareBitmapAsync()
        while ($bmpAsync.Status -eq 'Started') { Start-Sleep -Milliseconds 20 }
        $bmp = $bmpAsync.GetResults()

        $ocrAsync = $engine.RecognizeAsync($bmp)
        while ($ocrAsync.Status -eq 'Started') { Start-Sleep -Milliseconds 20 }
        $result = $ocrAsync.GetResults()

        Write-Host "=================== PAGE $i OCR RESULT ==================="
        Write-Host $result.Text
    }
}
