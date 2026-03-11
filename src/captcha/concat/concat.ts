import "../common/common.scss";
import "../slider/slider.scss";
import "./concat.scss";
import {Dom, CommonCaptcha, clearAllPreventDefault, down, initConfig, destroyEvent, showTips, closeTips} from "../common/common";
import { StyleConfig, CaptchaData, CaptchaConfigData } from "../../types";

const TYPE = "CONCAT";

function getTemplate(styleConfig: StyleConfig): string {
    return `
    <div id="tianai-captcha" class="tianai-captcha-slider tianai-captcha-concat">
    <div class="slider-tip">
        <span id="tianai-captcha-slider-move-track-font" >拖动滑块完成拼图</span>
    </div>
    <div class="content">
        <div class="tianai-captcha-slider-concat-img-div" id="tianai-captcha-slider-concat-img-div">
            <img id="tianai-captcha-slider-concat-slider-img" src="" alt/>
        </div>
        <div class="tianai-captcha-slider-concat-bg-img"></div>
         <div class="tianai-captcha-tips" id="tianai-captcha-tips"></div>
    </div>
    <div class="slider-move">
        <div class="slider-move-track">
            <div id="tianai-captcha-slider-move-track-mask"></div>
            <div class="slider-move-shadow"></div>
        </div>
        <div class="slider-move-btn" id="tianai-captcha-slider-move-btn">
        </div>
    </div>
</div>
    `;
}

class Concat extends CommonCaptcha {
    boxEl: any;
    styleConfig: StyleConfig;
    style: StyleConfig;
    type: string;
    currentCaptchaData: CaptchaConfigData;
    endCallback?: (data: any, captcha: any) => void;

    constructor(divId: any, styleConfig: StyleConfig) {
        super();
        this.boxEl = Dom(divId);
        this.styleConfig = styleConfig;
        this.style = styleConfig;
        this.type = TYPE;
        this.currentCaptchaData = {} as CaptchaConfigData;
    }

    init(captchaData: CaptchaData, endCallback: (data: any, captcha: Concat) => void, loadSuccessCallback?: (captcha: Concat) => void): Concat {
        // 重载样式
        this.destroy();
        this.boxEl.append(getTemplate(this.styleConfig));
        this.el = this.boxEl.find("#tianai-captcha");
        this.loadStyle();
        // 按钮绑定事件
        this.el.find("#tianai-captcha-slider-move-btn").mousedown(down.bind(null, this));
        this.el.find("#tianai-captcha-slider-move-btn").touchstart(down.bind(null, this));
        clearAllPreventDefault(this.el);
        // 绑定全局
        (window as any).currentCaptcha = this;
        // 载入验证码
        this.loadCaptchaForData(this, captchaData);
        this.endCallback = endCallback;
        if (loadSuccessCallback) {
            // 加载成功
            loadSuccessCallback(this);
        }
        return this;
    }

    showTips(msg: string, type: number, callback: () => void): void {
        showTips(this.el, msg, type, callback);
    }

    closeTips(msg: string, callback: () => void): void {
        closeTips(this.el, msg, callback);
    }

    destroy(): void {
        destroyEvent(this);
        const existsCaptchaEl = this.boxEl.children("#tianai-captcha");
        if (existsCaptchaEl) {
            existsCaptchaEl.remove();
        }
    }

    doMove(): void {
        const moveX = this.currentCaptchaData.moveX;
        if (moveX !== undefined) {
            this.el.find("#tianai-captcha-slider-move-btn").css("transform", "translate(" + moveX + "px, 0px)");
            this.el.find("#tianai-captcha-slider-concat-img-div").css("background-position-x", moveX + "px");
            this.el.find("#tianai-captcha-slider-move-track-mask").css("width", moveX + "px");
        }
    }

    loadStyle(): void {
        let sliderImg = "";
        let moveTrackMaskBorderColor = "#00f4ab";
        let moveTrackMaskBgColor = "#a9ffe5";
        const styleConfig = this.styleConfig;
        if (styleConfig) {
            sliderImg = styleConfig.btnUrl || "";
            moveTrackMaskBgColor = styleConfig.moveTrackMaskBgColor || moveTrackMaskBgColor;
            moveTrackMaskBorderColor = styleConfig.moveTrackMaskBorderColor || moveTrackMaskBorderColor;
        }
        this.el.find(".slider-move .slider-move-btn").css("background-image", "url(" + sliderImg + ")");
        // this.el.find("#tianai-captcha-slider-move-track-font").text(title);
        this.el.find("#tianai-captcha-slider-move-track-mask").css("border-color", moveTrackMaskBorderColor);
        this.el.find("#tianai-captcha-slider-move-track-mask").css("background-color", moveTrackMaskBgColor);
    }

    loadCaptchaForData(that: Concat, data: CaptchaData): void {
        const bgImg = that.el.find(".tianai-captcha-slider-concat-bg-img");
        const sliderImg = that.el.find("#tianai-captcha-slider-concat-img-div");
        bgImg.css("background-image", "url(" + (data.data?.backgroundImage || "") + ")");
        sliderImg.css("background-image", "url(" + (data.data?.backgroundImage || "") + ")");
        sliderImg.css("background-position", "0px 0px");
        var backgroundImageHeight = data.data?.backgroundImageHeight || 0;
        var height = ((backgroundImageHeight - (data.data?.data?.randomY || 0)) / backgroundImageHeight) * 180;
        sliderImg.css("height", height + "px");

        that.currentCaptchaData = initConfig(bgImg.width(), bgImg.height(), sliderImg.width(), sliderImg.height(), 300 - 63 + 5) as CaptchaConfigData;
        that.currentCaptchaData.currentCaptchaId = data.data?.id;
    }
}

export default Concat;
