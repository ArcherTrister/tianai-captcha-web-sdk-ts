import {CaptchaConfig, TianAiCaptcha} from "./captcha/captcha";

// 声明全局变量类型
declare global {
    interface Window {
        TAC: typeof TianAiCaptcha;
        CaptchaConfig: typeof CaptchaConfig;
        initTAC: typeof loadTAC;
        loadTAC: typeof loadTAC;
    }
}

// 加载 TAC 的函数
function loadTAC(tacPath: string | any, config: any, style?: any): Promise<TianAiCaptcha> {
    return new Promise((resolve, reject) => {
        let options = {
            ...(typeof tacPath === "string" ? {
                url: tacPath
            } : tacPath)
        };
        if (options.url) {
            if (!options.url.endsWith("/")) {
                options.url += "/";
            }
            if (!options.scriptUrls) {
                options.scriptUrls = [options.url + "js/tac.min.js"];
            }
            if (!options.cssUrls) {
                options.cssUrls = [options.url + "css/tac.css"];
            }
        }
        if (options.scriptUrls && options.cssUrls) {
            // 这里可以添加加载脚本和样式的逻辑
            // 由于我们已经在构建时包含了所有代码，这里简化处理
            resolve(new TianAiCaptcha(config, style));
        } else {
            reject("请按照文档配置tac");
        }
    });
}

// 导出到全局变量
window.TAC = TianAiCaptcha;
window.CaptchaConfig = CaptchaConfig;
window.loadTAC = loadTAC;
window.initTAC = loadTAC;
