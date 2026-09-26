# import required libraries
from tkinter import *
from tkinter import ttk
from random import *

# Create Object
root = Tk()

# Set geometry
root.geometry("500x500")

root.title("Rock Paper Scissors Game")

# List of players
choices = ["rock", "paper", "scissors"]

choose_number = randint(0, 2)
print(choose_number)  # For testing if it works

label = Label(root, text="Computer ", width=20, height=4, font=("Algerian", 20))
label.pack()


def spin():
    global user_select_value

    choose_number = randint(0, 2)
    label.config(text=choices[choose_number])

    if user_select.get() == "Rock":
        user_select_value = 0
    elif user_select.get() == "Paper":
        user_select_value = 1
    elif user_select.get() == "Scissors":
        user_select_value = 2

    if user_select_value == 0:
        if choose_number == 0:
            wl_label.config(text="Tie! - " + " Computer:Bad luck")
        elif choose_number == 1:
            wl_label.config(text="You Lose! - " + " Computer:I am better than you")
        elif choose_number == 2:
            wl_label.config(text="You Win! - " + " Computer: I will get you next time")
    elif user_select_value == 1:
        if choose_number == 0:
            wl_label.config(text="You Win! - " + " Computer: I will get you next time")
        elif choose_number == 1:
            wl_label.config(text="Tie! - " + " Computer:Bad luck")
        elif choose_number == 2:
            wl_label.config(text="You Lose! - " + " Computer:I am better than you")
    elif user_select_value == 2:
        if choose_number == 0:
            wl_label.config(text="You Lose! - " + " Computer:I am better than you")
        elif choose_number == 1:
            wl_label.config(text="You Win! - " + " Computer: I will get you next time")
        elif choose_number == 2:
            wl_label.config(text="Tie! - " + " Computer:Bad luck")


# Adding dropdown box for Rock, Paper, Scissors
user_select = ttk.Combobox(root, value=["Rock", "Paper", "Scissors"])
user_select.current(0)
user_select.pack()

# Add Labels,Button
wl_label = Label(root,text="",font=("arial",10),width=50,height=4)
wl_label.pack()

button = Button(root, text="Spin!",font=("bell mt",10), command=spin)
button.pack()

root.mainloop()
