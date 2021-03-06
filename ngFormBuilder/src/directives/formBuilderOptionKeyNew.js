/**
 * A directive for a field to edit a component's key.
 */
module.exports = function() {
  return {
    restrict: 'E',
    replace: true,
    template: function() {
      return '<div class="form-group" ng-class="{\'has-warning\': shouldWarnAboutEmbedding()}">' +
        'Manual Input <input type="checkbox" ng-model="component.manualIn" name="Manual Input"/>' +
        '<div class="alert alert-warning" role="alert" ng-if="!component.isNew">' +
        'Changing the API key will cause you to lose existing submission data associated with this component.' +
        '</div>' +
        '<div>' +
        '<label for="key" class="control-label" form-builder-tooltip="The name of this field in the API endpoint.">Property Name</label>' +
        '</div>' +
        '<div ng-if="component.manualIn">' +
        '<input type="text" class="form-control" id="key" name="key" ng-model="component.key" valid-api-key value="{{ component.key }}" ' +
        'ng-disabled="component.source" ng-blur="onBlur()">' +
        '<p ng-if="shouldWarnAboutEmbedding()" class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> ' +
        'Using a dot in your Property Name will link this field to a field from a Resource. Doing this manually is not recommended because you will experience unexpected behavior if the Resource field is not found. If you wish to embed a Resource field in your form, use a component from the corresponding Resource Components category on the left.' +
        '</p>' +
        '<p ng-if="manualWarn()" class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> ' +
        'Invalid API' +
        '</p>' +
        '</div>' +
        '<div ng-if="!component.manualIn">' +
        '         <td class="col-xs-6">' +
        '           <select class="form-control" ng-model="component.key" ng-options="f as f for f in component.apis" valid-api-key value="{{ component.key }}"' +
        'ng-disabled="component.source" ng-blur="onBlur()">' +
        '         </td>' +
        '</div>' +
        '</div>';
    },
    controller: ['$scope', 'BuilderUtils', 'UserService', function($scope, BuilderUtils, UserService) {
      BuilderUtils.uniquify($scope.form, $scope.component);
      $scope.component.apis = UserService.globalAPI;
      $scope.onBlur = function() {
        $scope.component.lockKey = true;

        // If they try to input an empty key, refill it with default and let uniquify make it unique.
        if (!$scope.component.key && $scope.formComponents[$scope.component.type].settings.key) {
          $scope.component.key = $scope.formComponents[$scope.component.type].settings.key;
          $scope.component.lockKey = false; // Also unlock key
          BuilderUtils.uniquify($scope.form, $scope.component);
        }
      };

      $scope.shouldWarnAboutEmbedding = function() {
        if (!$scope.component || !$scope.component.key) {
          return false;
        }
        return !$scope.component.source && $scope.component.key.indexOf('.') !== -1;
      };

      $scope.manualWarn = function() {
        if (!$scope.component) {
          return false;
        } else if ($scope.component.manualIn) {
          return $scope.component.apis.indexOf($scope.component.key) == -1;
        } else {
          return false;
        }
      };
    }]
  };
};
