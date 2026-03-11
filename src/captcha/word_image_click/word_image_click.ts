import ImageClick from "../image_click/image_click";
import { StyleConfig } from "../../types";

/**
 * 文字点选验证码
 */

const TYPE = "WORDIMAGECLICK";

class WordImageClick extends ImageClick {
    constructor(divId: any, styleConfig: StyleConfig) {
        super(divId, styleConfig);
        this.type = TYPE;
    }
}

export default WordImageClick;
