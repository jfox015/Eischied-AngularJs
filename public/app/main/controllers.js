'use strict';

    angApp
    .controller('EpisodesCtrl',['$scope','$modal', '_csrf', 'Episodes','Episode','EpisodeDelete', 
        function($scope, $modal, _csrf, Episodes, Episode, EpisodeDelete) {
	
        $scope.episodeList = [];
        $scope.searching = false;
        $scope.result = false;
        $scope.errors = false;
        
        function submitting () {
            $scope.result = false;
            $scope.searching = true;
            $scope.errors = false;
        }
        
        function update (data) {
            $scope.searching = false;
            if (typeof data.status !== "undefined" && data.status === 200) {
                handleResult(data);
            } else {
                $scope.errors = true;
                if (typeof data.errors !== "undefined" && typeof data.errors.err !== "undefined") $scope.errorMess = data.errors.err;
            }
        };
        
        function handleResult(data) {
            var date = new Date(data.episodes.airDate);
            data.episodes.airDate = date.toLocaleDateString();
            $scope.episodeList = data.episodes;
            $scope.searching = false;
            $scope.result = true;
            $scope.sortProp = 'number';
        } 
        
        var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

        function convertDateStringsToDates(input) {
            // Ignore things that aren't objects.
            if (typeof input !== "object") return input;

            for (var key in input) {
                if (!input.hasOwnProperty(key)) continue;

                var value = input[key];
                var match;
                // Check for string properties which look like dates.
                if (typeof value === "string" && (match = value.match(regexIso8601))) {
                    var milliseconds = Date.parse(match[0])
                    if (!isNaN(milliseconds)) {
                        input[key] = new Date(milliseconds);
                    }
                } else if (typeof value === "object") {
                    // Recurse into object
                    convertDateStringsToDates(value);
                }
            }
        }
        
        $scope.editEpisode = function(episode) {
            
            $scope.episodeE = episode;
            $modal.open({
                templateUrl: 'myModalContent.html',
                backdrop: 'static',
                windowClass: 'modal',
                controller: function ($scope, $modalInstance) {
                    $scope.episodeE = episode;
                    $scope.submit = function (id) {
                        submitting();
                        var airDate = Date.parse($scope.episodeE.airDate);           
                        var postVars = {
                                _csrf:  _csrf,
                                number: $scope.episodeE.number,
                                title: $scope.episodeE.title,
                                director: $scope.episodeE.director,
                                airDate: airDate,
                                writer: $scope.episodeE.writer
                            };
                        Episode.update({id:id}, postVars, 
                            function (result) {
                                update(result);
                                $modalInstance.dismiss('cancel');
                            }, function (error) {
                                $scope.putErrors = error;
                            }
                        );
                    }
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    episodeE: function () {
                        return $scope.episodeE;
                    }
                }
            });
        };        
        
        // fired when seach button is clicked
        $scope.getEpisodes = function () {
            Episodes.query(function(result) {
                update(result);
            }, function(error) {
                update(error);
            });
        };
        // fired when search button is clicked
        $scope.postEpisode = function () {
            submitting();
            var airDate = Date.parse($scope.episode.airDate);           
            var postVars = {
                    _csrf:  _csrf,
                    number: $scope.episode.number,
                    title: $scope.episode.title,
                    director: $scope.episode.director,
                    airDate: airDate,
                    writer: $scope.episode.writer
                };
            //console.log(angular.toJson(postVars));
            Episodes.save(postVars, 
                function (result) {
                    resetForm();
                    update(result);
                }, function (error) {
                    update(error);
                }
            );
        };
        
        $scope.deleteEpisode = function(id) {
            if (confirm("Are you sure you want to remove this episode?")){
                EpisodeDelete.get({id:   id},
                    function (result) {
                        update(result);
                    }, function (error) {
                        update(error);
                    }
                );
            }
        };

        // resets the form to presitine state
        function resetForm() {
            $scope.episode.number = '';
            $scope.episode.title = '';
            $scope.episode.director = '';
            $scope.episode.writer = '';
            $scope.episode.airDate = '';
        };
        
        $scope.getEpisodes();
        
        $scope.open = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope[opened] = true;
        };

          $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
    }
]); 