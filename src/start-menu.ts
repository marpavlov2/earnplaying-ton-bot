/* eslint-disable prettier/prettier */
import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import { bot } from './bot';
import { getConnector } from './ton-connect/connector';
import { handleSendTXCommand } from './commands-handlers';

export const placeBetMenuCallbacks = {
    how_it_works_command: onHowItWorksClick,
    place_bet_command: onPlaceBetClick
};

async function onHowItWorksClick(query: CallbackQuery, _: string): Promise<void> {
    const chatId = query.message!.chat.id;

    const connector = getConnector(chatId);

    if (!connector.connected) {
        bot.sendMessage(
            chatId,
            `<b>How it works:</b>\n
<b>Place your bet.</b> 🎲 The higher your bet, the higher your chance of winning.\n
<b>Wait for the required number of transactions</b> ⏳ in the current round or place new bets.\n
<b>The winner will be selected</b> 🏆 once the required number of transactions is received.\n
<b>The smart contract automatically transfers the award</b> 💰 to the winner's wallet.`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Connect wallet',
                                callback_data: JSON.stringify({
                                    method: 'connect',
                                    data: 'connect'
                                })
                            }
                        ]
                    ]
                }
            }
        );
    } else {
        bot.sendMessage(
            chatId,
            `<b>How it works:</b>\n
<b>Place your bet.</b> 🎲 The higher your bet, the higher your chance of winning.\n
<b>Wait for the required number of transactions</b> ⏳ in the current round or place new bets.\n
<b>The winner will be selected</b> 🏆 once the required number of transactions is received.\n
<b>The smart contract automatically transfers the award</b> 💰 to the winner's wallet.`,
            { parse_mode: 'HTML' }
        );
    }
}

async function onPlaceBetClick(query: CallbackQuery, _: string): Promise<void> {
    const chatId = query.message!.chat.id;

    bot.sendMessage(
        chatId,
        `<b>The higher your bet, the higher your chance of winning. 🏆🎲</b>\n\nPlease enter a number between <b>1</b> and <b>100 TON</b> to place your bet:`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true
            }
        }
    );

    // Listen for user's response
    bot.once('message', async (msg: TelegramBot.Message) => {
        // Ensure the message is from the same chat
        if (msg.chat.id === chatId && msg.text) {
            const betAmount = parseInt(msg.text);

            // Check if the input is a valid number between 1 and 100
            if (!isNaN(betAmount) && betAmount >= 1 && betAmount <= 100) {
                // Call handleSendTXCommand with the correct amount
                handleSendTXCommand(msg);
            } else {
                // If the input is invalid, notify the user and ask them to try again
                bot.sendMessage(chatId, 'Please enter a valid number between 1 and 100 TON.');
                // Re-prompt for the bet
                onPlaceBetClick(query, _);
            }
        }
    });
}
