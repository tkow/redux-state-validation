# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="4.0.0"></a>
# [4.0.0](https://github.com/tkow/redux-state-validation/compare/v3.1.0...v4.0.0) (2019-02-01)


### Features

* **ValidationWatcher:** warning option changed to strict ([62f827b](https://github.com/tkow/redux-state-validation/commit/62f827b))


### BREAKING CHANGES

* **ValidationWatcher:** warning is obsoleted



<a name="3.1.0"></a>
# [3.1.0](https://github.com/tkow/redux-state-validation/compare/v3.0.1...v3.1.0) (2018-11-20)


### Features

* **ValidationWatcherFactory.ts:** add feature validator with warning that adds errors state with th ([9871ec1](https://github.com/tkow/redux-state-validation/commit/9871ec1))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/tkow/redux-state-validation/compare/v3.0.0...v3.0.1) (2018-11-20)


### Bug Fixes

* **ValidationWatcherFactory.ts:** improve some perfomances and,fix bugs that throw error if first st ([74ec030](https://github.com/tkow/redux-state-validation/commit/74ec030))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/tkow/redux-state-validation/compare/v2.1.0...v3.0.0) (2018-11-06)


### Features

* enable id mapping when getting errors ([5b4edc1](https://github.com/tkow/redux-state-validation/commit/5b4edc1))
* expose ValidatorFactory ([428b0a0](https://github.com/tkow/redux-state-validation/commit/428b0a0))


### BREAKING CHANGES

* Errors simple array type are no longer available and errorId tie to errorObject
Array insted if specifing returnType='array', please concat if you needs array errors after getting
errors



<a name="2.1.0"></a>
# [2.1.0](https://github.com/tkow/redux-state-validation/compare/v2.0.4...v2.1.0) (2018-11-05)


### Bug Fixes

* get errors from about all validators ([f987008](https://github.com/tkow/redux-state-validation/commit/f987008))


### Features

* valdator receive second argument as action and use it by validation ([bf019d7](https://github.com/tkow/redux-state-validation/commit/bf019d7))



<a name="2.0.4"></a>
## [2.0.4](https://github.com/tkow/redux-state-validation/compare/v2.0.3...v2.0.4) (2018-11-05)



<a name="2.0.3"></a>
## [2.0.3](https://github.com/tkow/redux-state-validation/compare/v2.0.2...v2.0.3) (2018-11-03)



<a name="2.0.2"></a>
## [2.0.2](https://github.com/tkow/redux-state-validation/compare/v2.0.1...v2.0.2) (2018-11-03)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/tkow/redux-state-validation/compare/v2.0.0...v2.0.1) (2018-11-03)


### Bug Fixes

* enable to use even if initialstate is unloaded at store ([5dd8629](https://github.com/tkow/redux-state-validation/commit/5dd8629))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/tkow/redux-state-validation/compare/v1.2.1...v2.0.0) (2018-11-01)


### Features

* default return error value is id and enable it to switch type array or object ([6d51636](https://github.com/tkow/redux-state-validation/commit/6d51636))


### BREAKING CHANGES

* default is object, so change returnType option to 'array' to if you want to use
array



<a name="1.2.1"></a>
## [1.2.1](https://github.com/tkow/redux-state-validation/compare/v1.2.0...v1.2.1) (2018-11-01)


### Bug Fixes

* export interface ([53d19d5](https://github.com/tkow/redux-state-validation/commit/53d19d5))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/tkow/redux-state-validation/compare/v1.1.9...v1.2.0) (2018-11-01)


### Features

* export interface ([729b4fb](https://github.com/tkow/redux-state-validation/commit/729b4fb))



<a name="1.1.9"></a>
## [1.1.9](https://github.com/tkow/redux-state-validation/compare/v1.1.8...v1.1.9) (2018-11-01)


### Bug Fixes

* safety about null ([c17dba2](https://github.com/tkow/redux-state-validation/commit/c17dba2))



<a name="1.1.8"></a>
## [1.1.8](https://github.com/tkow/redux-state-validation/compare/v1.1.7...v1.1.8) (2018-10-31)


### Bug Fixes

* change combineReducers adaptive ([7cf8dd3](https://github.com/tkow/redux-state-validation/commit/7cf8dd3))
* for support combine reducers ([47bec58](https://github.com/tkow/redux-state-validation/commit/47bec58))



<a name="1.1.7"></a>
## [1.1.7](https://github.com/tkow/redux-state-validation/compare/v1.1.6...v1.1.7) (2018-10-30)


### Bug Fixes

* both capable of npm and yarn ([1ec2a7a](https://github.com/tkow/redux-state-validation/commit/1ec2a7a))



<a name="1.1.6"></a>
## [1.1.6](https://github.com/tkow/redux-state-validation/compare/v1.1.5...v1.1.6) (2018-10-30)



<a name="1.1.5"></a>
## [1.1.5](https://github.com/tkow/redux-state-validation/compare/v1.1.4...v1.1.5) (2018-10-30)



<a name="1.1.4"></a>
## [1.1.4](https://github.com/tkow/redux-state-validation/compare/v1.1.3...v1.1.4) (2018-10-30)



<a name="1.1.3"></a>
## [1.1.3](https://github.com/tkow/redux-state-validation/compare/v1.1.2...v1.1.3) (2018-10-30)



<a name="1.1.2"></a>
## [1.1.2](https://github.com/tkow/redux-state-validation/compare/v1.1.1...v1.1.2) (2018-10-30)



<a name="1.1.1"></a>
## [1.1.1](https://github.com/tkow/redux-state-validation/compare/v1.1.0...v1.1.1) (2018-10-30)



<a name="1.1.0"></a>
# 1.1.0 (2018-10-30)


### Features

* **prittier config:** prittier config ([702413e](https://github.com/tkow/redux-state-validation/commit/702413e))
