import "./image_click.scss";
import {Dom, CommonCaptcha, move, initConfig, destroyEvent, showTips, closeTips} from "../common/common";
import { StyleConfig, CaptchaData, CaptchaConfigData } from "../../types";

/**
 * 点选验证码
 */

const TYPE = "IMAGE_CLICK";

function getTemplate(styleConfig: StyleConfig): string {
    return `
<div id="tianai-captcha" class="tianai-captcha-slider tianai-captcha-word-click">
    <div class="click-tip">
        <span id="tianai-captcha-click-track-font" style="font-size: ${styleConfig.i18n?.image_click_title_size || '20px'}">${styleConfig.i18n?.image_click_title || '请依次点击:'}</span>
        <img src="" id="tianai-captcha-tip-img" class="tip-img">
    </div>
    <div class="content">
        <div class="bg-img-div">
            <img id="tianai-captcha-slider-bg-img" src="" alt/>
            <canvas id="tianai-captcha-slider-bg-canvas"></canvas>
            <div id="bg-img-click-mask"></div>
        </div>
         <div class="tianai-captcha-tips" id="tianai-captcha-tips"></div>
    </div>
    <div class="click-confirm-btn">确定</div>
</div>
`;
}

class ImageClick extends CommonCaptcha {
    boxEl: any;
    styleConfig: StyleConfig;
    style: StyleConfig;
    type: string;
    currentCaptchaData: CaptchaConfigData;
    endCallback?: (data: any, captcha: any) => void;

    constructor(boxEl: any, styleConfig: StyleConfig) {
        super();
        this.boxEl = boxEl;
        this.styleConfig = styleConfig;
        this.style = styleConfig;
        this.type = TYPE;
        this.currentCaptchaData = {} as CaptchaConfigData;
    }

    init(captchaData: CaptchaData, endCallback: (data: any, captcha: ImageClick) => void, loadSuccessCallback?: (captcha: ImageClick) => void): ImageClick {
        // 重载样式
        this.destroy();
        this.boxEl.append(getTemplate(this.styleConfig));
        this.el = this.boxEl.find("#tianai-captcha");
        // 绑定全局
        // window.currentCaptcha = this;
        // 载入验证码
        this.loadCaptchaForData(this, captchaData);
        this.endCallback = endCallback;
        const moveFun = move.bind(null, this);
        // 绑定事件
        this.el.find("#bg-img-click-mask").click((event: any) => {
            if (event.target.className === "click-span") {
                return;
            }
            if (!this.currentCaptchaData.tracks) {
                this.currentCaptchaData.tracks = [];
            }
            this.currentCaptchaData.clickCount = (this.currentCaptchaData.clickCount || 0) + 1;
            const tracks = this.currentCaptchaData.tracks;
            if (this.currentCaptchaData.clickCount === 1) {
                this.currentCaptchaData.startTime = new Date();
                // move 轨迹
                window.addEventListener("mousemove", moveFun);
                this.currentCaptchaData.startX = event.offsetX;
                this.currentCaptchaData.startY = event.offsetY;
            }
            const startTime = this.currentCaptchaData.startTime;
            tracks.push({
                x: Math.round(event.offsetX),
                y: Math.round(event.offsetY),
                type: "click",
                t: (new Date().getTime() - startTime.getTime())
            });
            const left = event.offsetX - 10;
            const top = event.offsetY - 10;
            this.el.find("#bg-img-click-mask").append("<span class='click-span' style='left:" + left + "px;top: " + top + "px'>" + this.currentCaptchaData.clickCount + "</span>");
            // if (this.currentCaptchaData.clickCount === 4) {
            //     // 校验
            //     this.currentCaptchaData.stopTime = new Date();
            //     window.removeEventListener("mousemove", move);
            //     this.endCallback(this.currentCaptchaData,this);
            // }
        });
        this.el.find(".click-confirm-btn").click(() => {
            if (this.currentCaptchaData.clickCount > 0) {
                // 校验
                this.currentCaptchaData.stopTime = new Date();
                window.removeEventListener("mousemove", moveFun);
                if (this.endCallback) {
                    this.endCallback(this.currentCaptchaData, this);
                }
            }
        });

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
        const existsCaptchaEl = this.boxEl.children("#tianai-captcha");
        if (existsCaptchaEl) {
            existsCaptchaEl.remove();
        }
        destroyEvent(this);
    }

    loadCaptchaForData(that: ImageClick, data: CaptchaData): void {
        const bgImg = that.el.find("#tianai-captcha-slider-bg-img");
        const tipImg = that.el.find("#tianai-captcha-tip-img");
        bgImg.on("load", () => {
            that.currentCaptchaData = initConfig(bgImg.width(), bgImg.height(), tipImg.width(), tipImg.height(), 0) as CaptchaConfigData;
            that.currentCaptchaData.currentCaptchaId = data.data?.id;
        });
        bgImg.attr("src", data.data?.backgroundImage || "");
        tipImg.attr("src", data.data?.templateImage || "");
    }
}

export default ImageClick;
