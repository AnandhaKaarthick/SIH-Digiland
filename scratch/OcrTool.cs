using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage;

class Program {
    static async Task Main(string[] args) {
        OcrEngine engine = OcrEngine.TryCreateFromUserProfileLanguage();
        for (int i = 1; i <= 3; i++) {
            string[] files = Directory.GetFiles("scratch", "page_" + i + "_Obj*.jpg");
            if (files.Length > 0) {
                StorageFile file = await StorageFile.GetFileFromPathAsync(Path.GetFullPath(files[0]));
                using (var stream = await file.OpenAsync(FileAccessMode.Read)) {
                    BitmapDecoder decoder = await BitmapDecoder.CreateAsync(stream);
                    SoftwareBitmap bmp = await decoder.GetSoftwareBitmapAsync();
                    OcrResult result = await engine.RecognizeAsync(bmp);
                    Console.WriteLine("=== PAGE " + i + " OCR ===");
                    Console.WriteLine(result.Text);
                }
            }
        }
    }
}
