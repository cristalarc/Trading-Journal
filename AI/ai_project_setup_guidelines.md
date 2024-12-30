    - When setting up a file structure, all projects must include a changelog file.
    - All projects must include a logger class that handles general logging tasks and can be called to any file. For example:
    import os
    import sys
    import logging
    from logging.handlers import RotatingFileHandler
    from datetime import datetime
    from pathlib import Path
    class Logger:
        """
        Custom logger class for the Trading Journal application.
        
        This logger implements:
        - Console logging with colored output
        - File logging with rotation
        - Different log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        - Formatted output with timestamp, level, and message
        
        Usage:
            from src.utils.logger import Logger
            logger = Logger.get_logger(__name__)
            logger.info("This is an info message")
            logger.error("This is an error message")
        """
        
        # ANSI escape sequences for colors
        COLORS = {
            'DEBUG': '\033[36m',     # Cyan
            'INFO': '\033[32m',      # Green
            'WARNING': '\033[33m',   # Yellow
            'ERROR': '\033[31m',     # Red
            'CRITICAL': '\033[41m',  # Red background
            'RESET': '\033[0m'       # Reset color
        }
        
        # Log format
        LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
        
        # Singleton instance
        _logger_instances = {}
        
        @classmethod
        def get_logger(cls, name: str) -> logging.Logger:
            """
            Get or create a logger instance for the given name.
            
            Args:
                name (str): The name of the logger (typically __name__)
                
            Returns:
                logging.Logger: Configured logger instance
            """
            if name in cls._logger_instances:
                return cls._logger_instances[name]
                
            logger = cls._setup_logger(name)
            cls._logger_instances[name] = logger
            return logger
        
        @classmethod
        def _setup_logger(cls, name: str) -> logging.Logger:
            """
            Set up a new logger instance with both file and console handlers.
            
            Args:
                name (str): The name of the logger
                
            Returns:
                logging.Logger: Newly configured logger instance
            """
            logger = logging.getLogger(name)
            logger.setLevel(logging.DEBUG)
            
            # Prevent adding handlers multiple times
            if logger.handlers:
                return logger
                
            # Create logs directory if it doesn't exist
            log_dir = Path("logs")
            log_dir.mkdir(exist_ok=True)
            
            # Create handlers
            console_handler = cls._setup_console_handler()
            file_handler = cls._setup_file_handler(log_dir)
            
            # Add handlers to logger
            logger.addHandler(console_handler)
            logger.addHandler(file_handler)
            
            return logger
        
        @classmethod
        def _setup_console_handler(cls) -> logging.StreamHandler:
            """
            Create and configure console handler with colored output.
            
            Returns:
                logging.StreamHandler: Configured console handler
            """
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(logging.DEBUG)
            
            class ColoredFormatter(logging.Formatter):
                def format(self, record):
                    if record.levelname in cls.COLORS:
                        record.levelname = f"{cls.COLORS[record.levelname]}{record.levelname}{cls.COLORS['RESET']}"
                    return super().format(record)
            
            formatter = ColoredFormatter(cls.LOG_FORMAT, cls.DATE_FORMAT)
            console_handler.setFormatter(formatter)
            return console_handler
        
        @classmethod
        def _setup_file_handler(cls, log_dir: Path) -> RotatingFileHandler:
            """
            Create and configure rotating file handler.
            
            Args:
                log_dir (Path): Directory where log files will be stored
                
            Returns:
                RotatingFileHandler: Configured file handler
            """
            log_file = log_dir / f"trading_journal_{datetime.now().strftime('%Y%m%d')}.log"
            file_handler = RotatingFileHandler(
                filename=log_file,
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5,
                encoding='utf-8'
            )
            file_handler.setLevel(logging.DEBUG)
            
            formatter = logging.Formatter(cls.LOG_FORMAT, cls.DATE_FORMAT)
            file_handler.setFormatter(formatter)
            return file_handler
        
        @staticmethod
        def handle_exception(exc_type, exc_value, exc_traceback):
            """
            Global exception handler to log unhandled exceptions.
            
            Usage:
                sys.excepthook = Logger.handle_exception
            """
            if issubclass(exc_type, KeyboardInterrupt):
                # Don't log keyboard interrupt
                sys.__excepthook__(exc_type, exc_value, exc_traceback)
                return
                
            logger = Logger.get_logger('error')
            logger.critical("Uncaught exception:", exc_info=(exc_type, exc_value, exc_traceback))
    # Set up global exception handling
sys.excepthook = Logger.handle_exception