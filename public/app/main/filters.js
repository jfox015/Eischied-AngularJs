'use strict';

angApp
.filter('errorText', 
    function() {
        return function(error) {
            if(typeof error !== "undefined") {
                // MonGO DB Duplicate Key error
                var regEx = /duplicate key error/;
                if (error.toString().match(regEx)) {
                    return "Duplicate Key Error. Please enter a unique number.";
                }
            }
        };
    }
);