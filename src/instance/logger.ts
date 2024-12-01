export class Logger {
    static info (...msg: any[]) {
        return console.log(`[INFO] 🔍 `, ...msg);
    }
    static warning (...msg: any[]) {
        return console.log(`[WARN] ⚠️ `, ...msg);
    }
    static success (...msg: any[]) {
        return console.log(`[DONE] ✅ `, ...msg);
    }
}