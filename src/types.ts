// 验证码配置接口
export interface CaptchaConfigOptions {
    bindEl: string;
    requestCaptchaDataUrl: string;
    validCaptchaUrl: string;
    validSuccess?: (res: any, c: any, tac: TianAiCaptcha) => void;
    validFail?: (res: any, c: any, tac: TianAiCaptcha) => void;
    requestHeaders?: Record<string, string>;
    btnCloseFun?: (el: any, tac: TianAiCaptcha) => void;
    btnRefreshFun?: (el: any, tac: TianAiCaptcha) => void;
    timeToTimestamp?: boolean;
}

// 样式配置接口
export interface StyleConfig {
    btnUrl?: string;
    bgUrl?: string;
    logoUrl?: string | null;
    moveTrackMaskBgColor?: string;
    moveTrackMaskBorderColor?: string;
    i18n?: {
        tips_success?: string;
        tips_error?: string;
        slider_title?: string;
        concat_title?: string;
        image_click_title?: string;
        rotate_title?: string;
        disable_title?: string;
        slider_title_size?: string;
        concat_title_size?: string;
        image_click_title_size?: string;
        rotate_title_size?: string;
        disable_title_size?: string;
    };
}

// 验证码数据接口
export interface CaptchaData {
    code: number;
    data?: {
        type: string;
        [key: string]: any;
    };
    [key: string]: any;
}

// 验证码轨道点接口
export interface Track {
    x: number;
    y: number;
    type: string;
    t: number;
}

// 验证码配置数据接口
export interface CaptchaConfigData {
    startTime: Date;
    stopTime?: Date;
    tracks: Track[];
    movePercent: number;
    clickCount: number;
    bgImageWidth: number;
    bgImageHeight: number;
    templateImageWidth: number;
    templateImageHeight: number;
    end: number;
    startX?: number;
    startY?: number;
    moveX?: number;
    moveY?: number;
    data?: any;
    currentCaptchaId?: string;
}

// 请求参数接口
export interface RequestParam {
    url: string;
    method: string;
    headers: Record<string, string>;
    data: any;
}

// 请求链接口
export interface RequestChain {
    preRequest?: (type: string, param: RequestParam, config: any, c: any, tac: TianAiCaptcha) => boolean;
    postRequest?: (type: string, param: RequestParam, res: any, config: any, c: any, tac: TianAiCaptcha) => boolean;
}

// 验证码基础接口
export interface BaseCaptcha {
    el: any;
    style: StyleConfig;
    currentCaptchaData: CaptchaConfigData;
    type: string;
    init: (data: CaptchaData, callback: (data: any, captcha: BaseCaptcha) => void) => void;
    destroy: () => void;
    doDown?: (event: any, captcha: BaseCaptcha) => void;
    doMove?: (event: any, captcha: BaseCaptcha) => void;
    doUp?: (event: any, captcha: BaseCaptcha) => void;
    showTips: (msg: string, type: number, callback: () => void) => void;
    closeTips: (msg: string, callback: () => void) => void;
}

// 主验证码类接口
export interface TianAiCaptcha {
    config: any;
    style: StyleConfig;
    domTemplate?: any;
    C?: BaseCaptcha;
    btnRefreshFun: (el: any, tac: any) => void;
    btnCloseFun: (el: any, tac: any) => void;
    defaultBtnRefreshFun?: (el: any, tac: any) => void;
    defaultBtnCloseFun?: (el: any, tac: any) => void;
    init: () => any;
    reloadCaptcha: () => void;
    showLoading: () => void;
    closeLoading: () => void;
    loadStyle: () => void;
    destroyWindow: () => void;
    openCaptcha: () => void;
    createCaptcha: () => void;
    destroyCaptcha: (callback: () => void) => void;
}
