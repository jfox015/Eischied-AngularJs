"use strict";

angApp.
directive('episodeList', ['partialsPath', function (partialsPath) {
    return {
        restrict: 'A',
        controller: 'EpisodesCtrl',
        templateUrl: partialsPath + 'main/episodes-view.html',
        link: function (scope, element, attrs) {

        }
    };
}])
.directive('a', function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
        }
   };
});