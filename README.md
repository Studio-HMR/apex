# Apex

> I'm trying to find a less edgy name. Sorry. It'll take some time.

A typesafe server toolkit for building OpenAPI/ REST compliant HTTP(S) apps. Uses [`ultimate-express`](https://github.com/dimdenGD/ultimate-express) (built using [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js/)) and [TypeBox](https://github.com/sinclairzx81/typebox) under the hood.

## Impetus

This project is *heavily* based on (/ a rip-off of) tRPC. [tRPC](https://github.com/trpc/trpc) helps enable quick API development iteration in an explicitly typesafe manner. However, since tRPC uses rpc-like behavior, you don't get a lot of the benefits that standards like OpenAPI provides for RESTful APIs. [`trpc-to-openapi`](https://github.com/mcampa/trpc-to-openapi) is an excellent extension of tRPC to support creating OpenAPI compliant applications, but it still ultimately leaves some things to be desired in terms of OpenAPI specification features that you can get out of the box via other OpenAPI spec tooling like [OpenAPI Generator]("https://openapi-generator.tech/").

Some things we'd like to do in this project to bridge that gap (and some additional nice-to-haves as well):

- [ ] URL paths/ path parsing as a first class concept
- [ ] Security schemes as a first class concept
- [ ] OpenAPI specific objects as first class concepts (aka info, contact, server)
- [ ] Automatically map shared reference types (schemas, parameters, responses) so that types aren't duplicated everywhere in the resulting OpenAPI spec
- [ ] Specific types to handle path parameters and query parameters
- [ ] Support multiple content types natively, including file/ media types as both request and response bodies
- [ ] (Hopefully) No errors getting lost in proxy callstack spaghetti on the client

## Reference Guide

### Nomenclature

Any really advanced TypeScript project needs to a little type golf (if you're not smart enough, i.e. me) to get things working as expected. Some standard nomenclature is used throughout the project to help maintain readability.

> [!NOTE]
> Generic type parameters use these symbols to specify usage information. You'll (hopefully) never be exposed to them; they're used primarily for internal type use.

|Symbol|Example|Description|
| ----:|:-|:---|
|`$(.*)`|`$Context`|The generic parameter is a type-only one; meaning the type is either (likely) populated for other types down in the spec or is only used for ensuring type-correctness.|
|`_(.*)`|`_Context`|The generic parameter represents a mutation on an existing generic on the type spec.|
|`T{.*}`|`TInput`|A Typebox schema is expected (but not required) here.|