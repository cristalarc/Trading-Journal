    - When creating classes, methods, features or any new file, always use Single Responsibility Principle to make sure the code is modular.
    - When creating code that handles database interactions, make sure to implement transaction management concepts so that we can ensure database consistency.
    - Set up unit testing for processes and data manipulation so that you can ensure your continuous changes don't break past verified systems.
    - Comment the code and provide docstrings. No excessive comment is needed, but at least comments in key parts that explain what the bloc of code will be doing. Use your judgement to create sufficient docstrings. For example:

    def create_menu(self):
        """
        Create the menu bar with Home, Trending, and Settings menus.
        """
        menubar = tk.Menu(self.master)
        self.master.config(menu=menubar)
        # Home menu
        menubar.add_command(label="Home", command=self.show_home)
        # Trending menu
        menubar.add_command(label="Trending", command=self.trending_page.show_trending)

    - Always provide sufficient error handling and error logging. Excessive logging is not needed, just minimal that signals that a major process ran successfully. For example:

from src.utils.logger import Logger
import sqlite3
import os
from datetime import datetime
class MyDatabaseClass:
    def __init__(self, conn):
        self.conn = conn
        # Get a logger for this class/module
        self.logger = Logger.get_logger(__name__)  
        # or simply: logger = Logger.get_logger(__name__) at module level
    def backup_database(self):
        # Create backup directory if it doesn't exist
        backup_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'db_backup'
        )
        os.makedirs(backup_dir, exist_ok=True)
        # Generate backup filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"tiktok_tracker_backup_{timestamp}.db"
        backup_path = os.path.join(backup_dir, backup_filename)
        try:
            # Create a new connection to the backup database
            backup_conn = sqlite3.connect(backup_path)
            with backup_conn:
                self.conn.backup(backup_conn)
            backup_conn.close()
            # Use our custom logger instead of 'logging'
            self.logger.info(f"Database backed up to {backup_path}")
        except Exception as e:
            self.logger.error(f"Error backing up database: {str(e)}")
            raise

    - As you create new methods, features or processes, please provide a QA punch list of processes to test for quality assurance.
Use Single Leading Underscore (_method) naming convention for internal use methods.