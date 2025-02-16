import express, { Request, Response } from "express";
import multer, { StorageEngine } from "multer";
import { environment } from "../environments/environment.local";
import path from "path";

const router = express.Router();

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
router.post("/", upload.single("file"), (req: MulterRequest, res: Response): Response => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    return res.json({ message: "File uploaded successfully", filename: req.file.filename });
});

export default router;
