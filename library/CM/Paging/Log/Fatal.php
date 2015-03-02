<?php

class CM_Paging_Log_Fatal extends CM_Paging_Log_Abstract {

    /**
     * @param string     $msg
     * @param array|null $metaInfo
     */
    public function add($msg, array $metaInfo = null) {
        $metaInfo = array_merge((array) $metaInfo, $this->_getDefaultMetaInfo());
        $this->_add($msg, $metaInfo);
    }

    public function cleanUp() {
        $this->_deleteOlderThan(30 * 86400);
    }
}
