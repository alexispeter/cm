<?php

class CM_Paging_Log_Error extends CM_Paging_Log_Abstract {

	const TYPE = 68;

	/**
	 * @param string $msg
	 */
	public function add($msg) {
		$this->_add($msg, $this->_getMetafInfoFromRequest());
	}
}
