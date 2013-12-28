lazyhub
=======

List your starred github repos that haven't been updated for a long time


## Installation

    pip install -r requirements.txt
    
## Run (In the project root directory)

    python manage.py runserver
    
## Production settings
In `lazyhub` folder, create a file `settings_local.py`, write followings:
    
    SECRET_KEY = 'your_production_key'
    DEBUG = False
    TEMPLATE_DEBUG = False
    ALLOWED_HOSTS = ['127.0.0.1', 'localhost']    
    
    
