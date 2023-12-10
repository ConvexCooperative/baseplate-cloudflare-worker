# baseplate-cloudflare-worker

## 4.0.4

### Patch Changes

- [#66](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/66) [`5c596c1`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/5c596c188497a6526bba3825ace82a5f1a324898) Thanks [@joeldenning](https://github.com/joeldenning)! - Fix react-dom systemjs url

## 4.0.3

### Patch Changes

- [#65](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/65) [`da88cd6`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/da88cd6baa3ffdaf9eeec5633c71f53508a126b0) Thanks [@joeldenning](https://github.com/joeldenning)! - Add react and react-dom to web-app import maps

## 4.0.2

### Patch Changes

- [#64](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/64) [`3c175d5`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/3c175d5cca2fac28f91bf9c66a08ea25f1d274f2) Thanks [@joeldenning](https://github.com/joeldenning)! - Skip invalid preloads in web apps rather than returning 500

## 4.0.1

### Patch Changes

- [#63](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/63) [`97f579f`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/97f579f1f3ca090935c77a1f04884fafc11c2b93) Thanks [@joeldenning](https://github.com/joeldenning)! - Add necessary dependencies to web app import maps

## 4.0.0

### Major Changes

- [#56](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/56) [`b51dbc2`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/b51dbc20fbe7e06b7f3aeed0c4083f7be526f745) Thanks [@joeldenning](https://github.com/joeldenning)! - Extend custom domains feature to support hosting parent apps

  Breaking: The expected value for the `custom-domain-${hostname}` key in Cloudflare KV Storage has changed from text to json

* [#62](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/62) [`1cc0737`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/1cc073745913dd71bd978e6fc1b4bb03e4417d99) Thanks [@joeldenning](https://github.com/joeldenning)! - Support different htmlTemplateParams for different customerEnvs

### Minor Changes

- [#55](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/55) [`dfad25c`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/dfad25cafc5c15d1bab3e12a5b92954b2fa87d30) Thanks [@joeldenning](https://github.com/joeldenning)! - Implement handleIndexHtml endpoint, for hosting web apps / root-configs

* [#60](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/60) [`155e0cb`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/155e0cb28d54bc01df9f1592ed149155007cc52a) Thanks [@joeldenning](https://github.com/joeldenning)! - Rewrite urls in import maps to use custom domains

- [#57](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/57) [`15837fd`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/15837fdd80d239cc135709fb24981a11c8ef8daa) Thanks [@joeldenning](https://github.com/joeldenning)! - Support for single-spa root configs

* [#58](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/58) [`835f68f`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/835f68ff4b4b05ea12d136ba2ae508ea92477757) Thanks [@joeldenning](https://github.com/joeldenning)! - Add `<link rel=preload>` elements automatically based on single-spa layout definition

### Patch Changes

- [#55](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/55) [`dfad25c`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/dfad25cafc5c15d1bab3e12a5b92954b2fa87d30) Thanks [@joeldenning](https://github.com/joeldenning)! - Upgrade @baseplate-sdk/utils

* [#60](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/60) [`155e0cb`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/155e0cb28d54bc01df9f1592ed149155007cc52a) Thanks [@joeldenning](https://github.com/joeldenning)! - Remove unneeded orgKey from import map URLs on custom domains

## 3.0.0

### Major Changes

- [#53](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/53) [`d728ad0`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/d728ad0a6a42df4190e6670cf5fe4d2127d9a045) Thanks [@joeldenning](https://github.com/joeldenning)! - Eliminate all differences between dev, test, and prod environments

### Minor Changes

- [#53](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/53) [`d728ad0`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/d728ad0a6a42df4190e6670cf5fe4d2127d9a045) Thanks [@joeldenning](https://github.com/joeldenning)! - Support for custom domains

## 2.1.0

### Minor Changes

- [#44](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/44) [`7140a7d`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/7140a7d50d15e13ac4d5d2a8608dbd2a87ec7052) Thanks [@joeldenning](https://github.com/joeldenning)! - Check that all necessary env variables are present

* [#42](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/42) [`707fb85`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/707fb85802015f26bb6e6d7ba6c41aee7f263e94) Thanks [@joeldenning](https://github.com/joeldenning)! - Log requests to AWS Timestream. Upgrade dependencies

### Patch Changes

- [#45](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/45) [`af64941`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/af6494107e70356fced666138dcf0e56b011cfa5) Thanks [@joeldenning](https://github.com/joeldenning)! - Set up deploys to test and prod cdns

* [#43](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/43) [`9dc8703`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/9dc870307f537c392c08869d742feb10e0a0af0b) Thanks [@joeldenning](https://github.com/joeldenning)! - Work on releasing to prod. Also support for custom s3 buckets

## 2.0.1

### Patch Changes

- [#41](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/41) [`13e044a`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/13e044a1787910710ca25303176beb280ada778a) Thanks [@joeldenning](https://github.com/joeldenning)! - Sample release to test Github workflow

## 2.0.0

### Major Changes

- [#34](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/34) [`20e0989`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/20e09897fb7d4c2a3869228fd041a5e93ae2669e) Thanks [@joeldenning](https://github.com/joeldenning)! - Rename to baseplate. Switch license to agpl + commons clause

### Minor Changes

- [#35](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/35) [`a160ede`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/a160ede00756c1d6fdaee1c198cc2ed72fa27d56) Thanks [@Ksouffle](https://github.com/Ksouffle)! - Added support for getting files from an s3 bucket

* [#30](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/30) [`5b6cd66`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/5b6cd66d43ecf4fc8889227f60451c6282a20c62) Thanks [@Ksouffle](https://github.com/Ksouffle)! - Added cache control for static files

### Patch Changes

- [#39](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/39) [`2cecf69`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/2cecf69ab8e0872d135d38bb006b95d7a3bb84de) Thanks [@joeldenning](https://github.com/joeldenning)! - Switch **main** to prod

* [#29](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/29) [`2fdf6a8`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/2fdf6a86cb3ad9669d6824d5c160a749ee005706) Thanks [@Ksouffle](https://github.com/Ksouffle)! - added baseplate-version header to all HTTP responses

- [#36](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/36) [`32a43ee`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/32a43ee9d11d13edc17d564d60933de1cb48a2e3) Thanks [@joeldenning](https://github.com/joeldenning)! - Upgrade dependencies

* [#40](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/pull/40) [`793f6b8`](https://github.com/JustUtahCoders/baseplate-cloudflare-worker/commit/793f6b8501a6cdd3c42a18053a945fabf909c261) Thanks [@joeldenning](https://github.com/joeldenning)! - Require Github release before deploying to customer-facing envs
