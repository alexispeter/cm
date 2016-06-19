<?php

class CM_Http_Response_PageTest extends CMTest_TestCase {

    public function tearDown() {
        CMTest_TH::clearEnv();
    }

    public function testProcessRedirect() {
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock11?count=3', ['host' => $site->getHost()]);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());

        $response->process();
        $this->assertContains('Location: ' . $response->getSite()->getUrl() . '/mock11?count=2', $response->getHeaders());
    }

    public function testProcessLanguageRedirect() {
        CMTest_TH::createLanguage('en');
        $viewer = CMTest_TH::createUser();
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/en/mock5', ['host' => $site->getHost()], null, $viewer);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());

        $response->process();
        $this->assertContains('Location: ' . $site->getUrl() . '/mock5', $response->getHeaders());
    }

    public function testProcessLanguageRedirect_parameter() {
        CMTest_TH::createLanguage('en');
        $viewer = CMTest_TH::createUser();
        $location = CMTest_TH::createLocation();
        $locationEncoded = CM_Params::encode($location, true);
        $query = http_build_query(['location' => $locationEncoded]);

        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/en/mock5?' . $query, ['host' => $site->getHost()], null, $viewer);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());

        $response->process();
        $siteUrl = $response->getSite()->getUrl();
        $this->assertContains('Location: ' . $siteUrl . '/mock5?' . $query, $response->getHeaders());
    }

    public function testProcessLanguageNoRedirect() {
        $language = CMTest_TH::createLanguage('en');
        $site = CM_Site_Abstract::factory();

        $request = new CM_Http_Request_Get('/en/mock5', ['host' => $site->getHost()]);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());
        $response->process();
        $this->assertEquals($language, $response->getRequest()->getLanguageUrl());

        $request = new CM_Http_Request_Get('/mock5', ['host' => $site->getHost()]);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());
        $response->process();
        $this->assertNull($response->getRequest()->getLanguageUrl());

        $viewer = CMTest_TH::createUser();
        $request = new CM_Http_Request_Get('/mock5', ['host' => $site->getHost()], null, $viewer);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());
        $response->process();
        $this->assertNull($response->getRequest()->getLanguageUrl());
        foreach ($response->getHeaders() as $header) {
            $this->assertNotContains('Location:', $header);
        }
    }

    public function testProcessHostRedirect() {
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock5', ['host' => $site->getHost()]);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());

        $response->process();
        $this->assertFalse(Functional\some($response->getHeaders(), function ($header) {
            return preg_match('/^Location:/', $header);
        }));
    }

    public function testProcessUnknownHostRedirect() {
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock5', ['host' => 'unknown-host.org']);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());

        $response->process();
        $this->assertContains('Location: ' . $site->getUrl() . '/mock5', $response->getHeaders());
    }

    public function testProcessHostRedirect_parameter() {
        $location = CMTest_TH::createLocation();
        $locationEncoded = CM_Params::encode($location, true);
        $query = http_build_query(['location' => $locationEncoded]);
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock5?' . $query, ['host' => 'unknown-host.org']);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());

        $response->process();
        $this->assertContains('Location: ' . $site->getUrl() . '/mock5?' . $query, $response->getHeaders());
    }

    public function testProcessTrackingDisabled() {
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock5', ['host' => $site->getHost()]);
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $this->getServiceManager());

        $response->process();
        $html = $response->getContent();
        $this->assertNotContains('ga("send", "pageview", "\/mock5")', $html);
        $this->assertNotContains("_kmq.push(['identify'", $html);
        $this->assertNotContains("_kmq.push(['alias'", $html);
    }

    public function testProcessTrackingCanNotTrackPageView() {
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock8', ['host' => $site->getHost()]);
        $serviceManager = $this->_getServiceManager('ga123', 'km123');
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $serviceManager);

        $response->process();
        $html = $response->getContent();
        $this->assertNotContains('ga("send", "pageview"', $html);
        $this->assertNotContains("_kmq.push(['identify'", $html);
        $this->assertNotContains("_kmq.push(['alias'", $html);
    }

    public function testProcessTrackingVirtualPageView() {
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock9', ['host' => $site->getHost()]);
        $serviceManager = $this->_getServiceManager('ga123', 'km123');
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $serviceManager);

        $response->process();
        $html = $response->getContent();
        $this->assertContains('ga("create", "ga123"', $html);
        $this->assertContains('ga("send", "pageview", "\/v\/foo")', $html);
        $this->assertContains('var _kmq = _kmq || [];', $html);
        $this->assertContains("var _kmk = _kmk || 'km123';", $html);
        $clientId = $request->getClientId();
        $this->assertContains("_kmq.push(['identify', 'Guest {$clientId}']);", $html);
        $this->assertNotContains("_kmq.push(['alias'", $html);
    }

    public function testProcessTrackingVirtualPageViewWithError() {
        CM_Config::get()->CM_Http_Response_Page->exceptionsToCatch = [
            'CM_Exception_InvalidParam' => ['errorPage' => 'CM_Page_Error_NotFound', 'log' => false],
        ];
        $this->getMock('CM_Layout_Abstract', null, [], 'CM_Layout_Default');

        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock10', ['host' => $site->getHost()]);
        $serviceManager = $this->_getServiceManager('ga123', 'km123');
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $serviceManager);

        $response->process();
        $html = $response->getContent();
        $this->assertContains('ga("create", "ga123"', $html);
        $this->assertContains('ga("send", "pageview", "\/v\/bar")', $html);
        $this->assertContains('var _kmq = _kmq || [];', $html);
        $this->assertContains("var _kmk = _kmk || 'km123';", $html);
        $clientId = $request->getClientId();
        $this->assertContains("_kmq.push(['identify', 'Guest {$clientId}']);", $html);
        $this->assertNotContains("_kmq.push(['alias'", $html);
    }

    public function testProcessTrackingGuest() {
        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock5', ['host' => $site->getHost()]);
        $serviceManager = $this->_getServiceManager('ga123', 'km123');
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $serviceManager);

        $response->process();
        $html = $response->getContent();
        $this->assertContains('ga("create", "ga123"', $html);
        $this->assertContains('ga("send", "pageview", "\/mock5")', $html);
        $this->assertContains('var _kmq = _kmq || [];', $html);
        $this->assertContains("var _kmk = _kmk || 'km123';", $html);
        $clientId = $request->getClientId();
        $this->assertContains("_kmq.push(['identify', 'Guest {$clientId}']);", $html);
        $this->assertNotContains("_kmq.push(['alias'", $html);
    }

    public function testProcessTrackingViewer() {
        /** @var CM_Model_User|PHPUnit_Framework_MockObject_MockObject $viewer */
        $viewer = $this->getMock('CM_Model_User', array('getIdRaw', 'getVisible', 'getLanguage', 'getCurrency'));
        $viewer->expects($this->any())->method('getIdRaw')->will($this->returnValue(array('id' => '1')));
        $viewer->expects($this->any())->method('getVisible')->will($this->returnValue(false));
        $viewer->expects($this->any())->method('getLanguage')->will($this->returnValue(null));
        $viewer->expects($this->any())->method('getCurrency')->will($this->returnValue(null));

        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/mock5', ['host' => $site->getHost()], null, $viewer);
        $serviceManager = $this->_getServiceManager('ga123', 'km123');
        $response = CM_Http_Response_Page::createFromRequest($request, $site, $serviceManager);

        $response->process();
        $html = $response->getContent();
        $this->assertContains('ga("create", "ga123"', $html);
        $this->assertContains('ga("send", "pageview", "\/mock5")', $html);
        $this->assertContains('var _kmq = _kmq || [];', $html);
        $this->assertContains("var _kmk = _kmk || 'km123';", $html);
        $clientId = $request->getClientId();
        $this->assertContains("_kmq.push(['identify', 'Guest {$clientId}']);", $html);
        $this->assertContains("_kmq.push(['identify', '1']);", $html);
        $this->assertContains("_kmq.push(['alias', 'Guest {$clientId}', '1']);", $html);
    }

    public function testProcessExceptionCatching() {
        CM_Config::get()->CM_Http_Response_Page->exceptionsToCatch = [
            'CM_Exception_InvalidParam' => ['errorPage' => 'CM_Page_Error_NotFound', 'log' => false],
        ];
        $this->getMock('CM_Layout_Abstract', null, [], 'CM_Layout_Default');

        $site = CM_Site_Abstract::factory();
        $request = new CM_Http_Request_Get('/example', ['host' => $site->getHost()]);
        /** @var CM_Http_Response_Page|\Mocka\AbstractClassTrait $response */
        $response = $this->mockObject('CM_Http_Response_Page', [$request, $site, $this->getServiceManager()]);
        $response->mockMethod('_renderPage')->set(function (CM_Page_Abstract $page) {
            if ($page instanceof CM_Page_Example) {
                throw new CM_Exception_InvalidParam();
            }
            return '<html>Error</html>';
        });

        $this->assertSame('/example', $response->getRequest()->getPath());
        $response->process();
        $this->assertSame('/error/not-found', $response->getRequest()->getPath());
    }

    /**
     * @param string $codeGoogleAnalytics
     * @param string $codeKissMetrics
     * @return CM_Service_Manager
     */
    protected function _getServiceManager($codeGoogleAnalytics, $codeKissMetrics) {
        $serviceManager = new CM_Service_Manager();
        $serviceManager->registerInstance('googleanalytics', new CMService_GoogleAnalytics_Client($codeGoogleAnalytics));
        $serviceManager->registerInstance('kissmetrics', new CMService_KissMetrics_Client($codeKissMetrics));
        $serviceManager->registerInstance('trackings', new CM_Service_Trackings(['googleanalytics', 'kissmetrics']));

        $serviceManager->registerInstance('logger', new CM_Log_Logger(new CM_Log_Context()));
        $serviceManager->registerInstance('newrelic', new CMService_Newrelic(false, 'unit-test'));
        return $serviceManager;
    }
}

class CM_Page_Mock5 extends CM_Page_Abstract {

    public function getLayout(CM_Frontend_Environment $environment, $layoutName = null) {
        return new CM_Layout_Mock();
    }
}

class CM_Page_Mock8 extends CM_Page_Abstract {

    public function getCanTrackPageView() {
        return false;
    }

    public function getLayout(CM_Frontend_Environment $environment, $layoutName = null) {
        return new CM_Layout_Mock();
    }
}

class CM_Page_Mock9 extends CM_Page_Abstract {

    public function getPathVirtualPageView() {
        return '/v/foo';
    }

    public function getLayout(CM_Frontend_Environment $environment, $layoutName = null) {
        return new CM_Layout_Mock();
    }
}

class CM_Page_Mock10 extends CM_Page_Abstract {

    public function getPathVirtualPageView() {
        return '/v/bar';
    }

    public function getLayout(CM_Frontend_Environment $environment, $layoutName = null) {
        return new CM_Layout_Mock();
    }

    public function prepare(CM_Frontend_Environment $environment, CM_Frontend_ViewResponse $viewResponse) {
        throw new CM_Exception_InvalidParam();
    }
}

class CM_Page_Mock11 extends CM_Page_Abstract {

    public function prepareResponse(CM_Frontend_Environment $environment, CM_Http_Response_Page $response) {
        $count = $this->_params->getInt('count');
        if ($count > 0) {
            $response->redirect($this, ['count' => --$count]);
        }
    }

    public function getLayout(CM_Frontend_Environment $environment, $layoutName = null) {
        return new CM_Layout_Mock();
    }
}

class CM_Layout_Mock extends CM_Layout_Abstract {

}
