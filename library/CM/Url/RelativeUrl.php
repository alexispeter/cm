<?php

namespace CM\Url;

class RelativeUrl extends AbstractUrl {

    public function withEnvironment(\CM_Frontend_Environment $environment, array $options = null) {
        $options = array_merge([
            'sameOrigin' => false,
        ], (array) $options);

        $site = $environment->getSite();
        $url = $site->getUrlBase();
        if (!$options['sameOrigin'] && $site->getUrlCdn()) {
            $url = $site->getUrlCdn();
        }
        $urlPath = $this->_buildPath($environment);
        return $url
            ->withPath((string) $urlPath)
            ->withQuery($this->getQuery())
            ->withFragment($this->getFragment());
    }

    /**
     * @param \CM_Frontend_Environment $environment
     * @return \League\Uri\Interfaces\HierarchicalPath
     */
    protected function _buildPath(\CM_Frontend_Environment $environment) {
        return $this->path;
    }

    /**
     * @inheritdoc
     */
    protected function isValid() {
        return $this->isValidGenericUri()
            && $this->isValidRelativeUri();
    }

    /**
     * @return bool
     */
    protected function isValidRelativeUri() {
        return '' === $this->getScheme() && '' === $this->getHost();
    }
}
