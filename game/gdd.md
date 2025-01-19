# Game Design Document

This is going to be a clone of the popular game Snake.

## Game Mechanics

- The player will control a snake that moves around the screen.
- The snake will eat food to grow longer.
- The snake will die if it hits the edge of the screen or itself.
- The player games points for food eaten.
- The snake starts off with 3 segments.

## Game Visuals

- The game will be a retro arcade style game.
- The game will use basic shapes and colors.

- Add visual borders around the game area so that it is clear they are walls.
- Show the player's score, as well as the best score they have ever obtained.
- Show the player's display name, if authenticated.

## Game Controls

- The player will use the arrow keys to move the snake.
- The player can pause the game by pressing ESC
- The player can resume the game by pressing ESC again, or Spacebar.

## Game Flow

- The app starts with a Main Menu.
- From the Main Menu, the player starts the game signed in as a guest or with Google auth.
- While playing the game, the player can pause the game.
- In the pause menu, the player can resume by pressing ESC or return to the main menu
- If the player loses, the game is over, and their score is stored in the backend.
- The player can log out from the game back to the main menu.

## Game Backend

- The database should store every score obtained by the player.
- The database should store the player's display name.
- The leaderboard that shows the top 10 players.
- The leaderboard will only show the player's highest score ever obtained.
- The player can choose to play as a Guest, or log in via Google Auth.
- When authenticated as a Guest, the player is given a generated name.
- When authenticated with Google Auth, the player's email is used.
- When a player logs out, the session is destroyed.
