var config = angular.module('tmweb.config', [])
        .constant('APP_NAME', "Eurostar")
        .constant('ENV', "")
        .constant('API_ENDPOINT', "https://test1-eurostar-aws.isdev.info/tma-middleware")
        .constant('SESSION_COOKIE_KEY', "TMA_SESSION_ID")
        // new messages alerts
        .constant('NM_ALERTS', true)
        .constant('NM_ALERTS_LOG', true)
        .constant('NM_ALERTS_INTERVAL', 60000)
        .constant('NM_ALERTS_ROLES', ['ALL', 'ECC', 'CRE', 'OBSM'])
    ;
