import { MessageEmbed } from "discord.js";
import { Command } from "../../../typings";

type RPSChoices = "r" | "p" | "s";
type RPSResults = "win" | "lose" | "draw";

function getComputerChoice() {
  const choices: RPSChoices[] = ["r", "p", "s"];
  const randomNum = Math.floor(Math.random() * choices.length);
  return choices[randomNum];
}

function charToWord(char: RPSChoices) {
  switch (char) {
    case "r":
      return "Rock";
    case "p":
      return "Paper";
    case "s":
      return "Scissors";
  }
}

function embedBuilder(
  result: RPSResults,
  compChoice: RPSChoices,
  playerChoice: RPSChoices
) {
  const embed = new MessageEmbed()
    .addField("Player's Choice", charToWord(playerChoice), true)
    .addField("Computer's Choice", charToWord(compChoice), true);

  if (result === "win") {
    embed.setColor("#00ff00").setTitle("You Won!");
  } else if (result === "lose") {
    embed.setColor("#ff0000").setTitle("You Lost!");
  } else {
    embed.setColor("#ffff00").setTitle("It's a Draw!");
  }

  return embed;
}

function getResults(compChoice: RPSChoices, playerChoice: RPSChoices) {
  switch (true) {
    // Draw conditions
    case compChoice === playerChoice:
      return embedBuilder("draw", compChoice, playerChoice);

    // Win conditions
    case compChoice === "r" && playerChoice === "p":
    case compChoice === "p" && playerChoice === "s":
    case compChoice === "s" && playerChoice === "r":
      return embedBuilder("win", compChoice, playerChoice);

    // Lose conditions
    default:
      return embedBuilder("lose", compChoice, playerChoice);
  }
}

const command: Command = {
  data: {
    name: "rps",
    description: "Rock Paper Scissors",
    options: [
      {
        name: "choice",
        description: "Your hand",
        required: true,
        type: "STRING",
        choices: [
          {
            name: "Rock",
            value: "r",
          },
          {
            name: "Paper",
            value: "p",
          },
          {
            name: "Scissors",
            value: "s",
          },
        ],
      },
    ],
  },
  aliases: [],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: true,
  rolesRequired: [],
  async executeMessage(message, args) {
    const ans = args[0].toLowerCase();

    if (ans !== "r" && ans !== "p" && ans !== "s") {
      message.channel.send("Not a valid answer!");
      return;
    }

    const compChoice = getComputerChoice();
    const res = getResults(compChoice, ans);
    message.channel.send({ embeds: [res] });
  },
  async executeInteraction(interaction) {
    const ans = interaction.options.getString("choice", true) as RPSChoices;

    const compChoice = getComputerChoice();
    const res = getResults(compChoice, ans);
    interaction.reply({ embeds: [res] });
  },
};

export default command;
