import { CanvasRenderingContext2D } from "../../node_modules/as2d/assembly/index"

const whiteSpaceRegexp = "\s"

export function drawToken (context: CanvasRenderingContext2D, text: string, color: string, x: i32, y: i32, charWidth: i32, charHeight: i32, ignoreWhitespacesInTokens: boolean): i32 {
  context.fillStyle = color

  if (ignoreWhitespacesInTokens) {
    const length = text.length * charWidth
    context.fillRect(x, y, length, charHeight)

    return x + length
  } else {
    let chars = 0
    for (let j: i32 = 0, len: i32 = text.length; j < len; j++) {
      const char = text.charAt(j)
      if (whiteSpaceRegexp === char) {
        if (chars > 0) {
          context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight)
        }
        chars = 0
      } else {
        chars++
      }
      x += charWidth
    }
    if (chars > 0) {
      context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight)
    }
    return x
  }
}
