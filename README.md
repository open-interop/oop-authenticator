# oop-authenticator

This is the authentication service for OpenInterop.

Unauthenticated messages are consumed and matched with authentication criteria supplied by [oop-core](https://github.com/open-interop/oop-core).

Matching is based on a set of key value pairs, where the key is a dot separated path to the value which will be checked. E.g. to check the path is a given string: `{"path": "/posting/endpoint"}` or to check a given header contains a given value: `{"headers.x-api-key": "foobar"}`.

Multiple path, value pairs can be given and *all* must match for the message to be authenticated.

## Installation

- Ensure node is installed with version at least `10.16.2` LTS.
- Install `yarn` if necessary (`npm install -g yarn`).
- Run `yarn install` to install the node dependencies.
- Once everything is installed the service can be started with `yarn start`.

## Configuration

- `OOP_AMQP_ADDRESS`: The address of the AMQP messaging service.
- `OOP_EXCHANGE_NAME`: The message exchange for Open Interop.
- `OOP_ERROR_EXCHANGE_NAME`:  The exchange errors will be published to.
- `OOP_JSON_ERROR_Q`: The queue JSON decode messages will be published to.
- `OOP_AUTHENTICATOR_INPUT_Q`: The queue this service will consume messages from.
- `OOP_AUTHENTICATOR_OUTPUT_Q`: The queue this service will publish messages to.
- `OOP_CORE_API_URL`: The API URL for core which will be used to request authentication details.
- `OOP_CORE_TOKEN`: The API token for core.
- `OOP_CORE_DEVICE_UPDATE_EXCHANGE`: The queue this service will consume update events from.

## Testing

`yarn test` to run the tests and generate a coverage report.

## Contributing

We welcome help from the community, please read the [Contributing guide](https://github.com/open-interop/oop-guidelines/blob/master/CONTRIBUTING.md) and [Community guidelines](https://github.com/open-interop/oop-guidelines/blob/master/CODE_OF_CONDUCT.md).

## Licence

Copyright (C) 2019 Blue Frontier IT Ltd

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
