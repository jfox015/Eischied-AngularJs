'use strict';

angApp
.factory('Episodes', function ($resource) {
    return $resource('/api/episodes', {}, {query: {isArray: false}});  
})
.factory('Episode', ['$resource', function($resource){
    return $resource('/api/episode/:id', null, {
        query:    { method: 'GET', isArray: false },
        update:   { method:'PUT', isArray: false }
    });
}])
.factory('EpisodeDelete', function ($resource) {
    return $resource('/api/episode/delete/:id', {}, {query: {method: 'GET', isArray: false}});  
});