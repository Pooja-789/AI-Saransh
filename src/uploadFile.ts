import express, { Request, Response } from "express";
import multer, { StorageEngine } from "multer";
import { environment } from "../environments/environment.local";
import { FileParseService } from "./app/service/file-parse.service";

const router = express.Router();

const fileParseService=new FileParseService();

// ✅ Extend Express Request to include Multer's file property
interface MulterRequest extends Request {
    file?: Express.Multer.File; // `file` is optional because it may be undefined
}

// 🔹 Configure Multer Storage with TypeScript types
const storage: StorageEngine = multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void => {
        cb(null, environment.fileUploadDirectory); // Ensure this folder exists
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// 🔹 Use `MulterRequest` instead of `Request`
// router.post("/", upload.single("file"), async (req: MulterRequest, res: Response): Promise<Response>  =>  {
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//     }
//     const file = req.file as Express.Multer.File;

//     // Process each uploaded file
//     // for (const file of files) {
//       console.log(`Processing file: ${file.originalname}, Path: ${file.path}`);
//         await fileParseService.loadPdfContent(file.path);
//     // }
//     return res.json({ message: "File uploaded successfully", filename: req.file.filename });
// });

router.post("/", upload.single("file"), async (req: MulterRequest, res: Response): Promise<Response>  =>  {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const file = req.file as Express.Multer.File;
    console.log(`Processing file: ${file.originalname}, Path: ${file.path}`);

    try {
        const pdfText = await fileParseService.loadPdfContent(file.path);
        return res.json({ summary: pdfText });
    } catch (error) {
        console.error("PDF parsing error:", error);
        return res.status(500).json({ message: "Error parsing PDF" });
    }
});

export default router;
