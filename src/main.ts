/* eslint-disable prettier/prettier */
import dotenv from 'dotenv';
dotenv.config();

import { bot } from './bot';
import { walletMenuCallbacks } from './connect-wallet-menu';
import {
    handleConnectCommand,
    handleDisconnectCommand,
    handleSendTXCommand,
    handleShowMyWalletCommand
} from './commands-handlers';
import TelegramBot from 'node-telegram-bot-api';
import { placeBetMenuCallbacks } from './start-menu';

async function main(): Promise<void> {
    const callbacks = {
        ...walletMenuCallbacks,
        ...placeBetMenuCallbacks
    };

    bot.on('callback_query', query => {
        if (!query.data) {
            return;
        }

        let request: { method: string; data: string };

        try {
            request = JSON.parse(query.data);
        } catch {
            return;
        }

        if (!callbacks[request.method as keyof typeof callbacks]) {
            return;
        }

        callbacks[request.method as keyof typeof callbacks](query, request.data);
    });

    bot.onText(/\/connect/, handleConnectCommand);

    bot.onText(/\/placebet/, (msg: TelegramBot.Message) => {
        const chatId = msg.chat.id;

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
                }
            }
        });
    });

    bot.onText(/\/disconnect/, handleDisconnectCommand);

    bot.onText(/\/my_wallet/, handleShowMyWalletCommand);

    bot.onText(/\/start/, (msg: TelegramBot.Message) => {
        bot.sendMessage(
            msg.chat.id,
            `
Welcome to earnplaying.org app!
                        
Commands list: 
/connect - Connect to a wallet
/my_wallet - Show connected wallet
/placebet - Reply to a message and send transaction
/disconnect - Disconnect from the wallet

Website: https://earnplaying.org
            `,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'How it works',
                                callback_data: JSON.stringify({
                                    method: 'how_it_works_command',
                                    data: 'how_it_works_command'
                                })
                            }
                        ]
                    ]
                }
            }
        );
    });
}

main();
