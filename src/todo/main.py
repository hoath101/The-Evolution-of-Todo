"""Application entry point for Todo Application."""

from todo import cli


def main() -> None:
    """
    Main application entry point.

    Initializes application, displays welcome message, and runs main loop.
    """
    # Display welcome message
    print("\nWelcome to the Todo Application!")
    print("All tasks are stored in-memory and will be lost when you exit.\n")

    # Main application loop
    while True:
        cli.display_menu()
        choice = cli.get_menu_choice()

        continue_running = cli.handle_menu_choice(choice)

        if not continue_running:
            print("\nGoodbye!")
            break


if __name__ == "__main__":
    main()
