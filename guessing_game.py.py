import random
secret_number = random.randint(1, 100)
attempts = 0
while True:
    #Get player input and convert it from a string to an integer
    guess = int(input("Guess a number between 1 and 100: "))
    attempts += 1

    # Check the player's guess
    if guess < secret_number:
        print("Too low! Try_again.")
    elif guess > secret_number:
        print("Too high! Try again.")
    else:
        print(f"Congradulations! You've guessed it in {attemts} attempts.")
        break #Exit the loop if the guess is correct

