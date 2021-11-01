import { MyInteraction, MyMessage } from "typings";
import { charSlicer } from ".";
import { RequestError } from "got/dist/source";
import { stripIndents } from "common-tags";

/**
 * Error Handler for Got HTTP requests.
 * @param message   Discord Message
 * @param err       Error to be handled.
 */
export async function gotErrorHandler(
  message: MyMessage,
  err: RequestError
): Promise<void>;

/**
 * Error Handler for Got HTTP requests.
 * @param interaction   Discord Interaction
 * @param err           Error to be handled.
 */
export async function gotErrorHandler(
  interaction: MyInteraction,
  err: RequestError
): Promise<void>;

/**
 * Error Handler for Got HTTP requests.
 * @param instance  Discord Message or Interaction
 * @param err       Error to be handled.
 */
export async function gotErrorHandler(
  instance: MyMessage | MyInteraction,
  err: RequestError
): Promise<void>;

export async function gotErrorHandler(
  instance: MyMessage | MyInteraction,
  err: RequestError
): Promise<void> {
  if (err.response) {
    const text = stripIndents`
            **There was an error!**
            \`HTTP StatusCode: ${err.response.statusCode}\n${err.message}\`
            **Response Data:**\n\`${JSON.stringify(err.response.body)}\`
        `;

    await instance.reply(charSlicer(text, 2000));
  } else if (err.request) {
    const errMsg = stripIndents`
            There was an error!
            \`Request made but no Response received
            ${err.message}\`
        `;

    await instance.reply(errMsg);
  } else {
    await instance.reply(
      `There was an error!\n\`${err.code} | ${err.message}\``
    );
  }
}

export default gotErrorHandler;
