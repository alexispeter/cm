<?php

abstract class CM_Jobdistribution_Job_Abstract extends CM_Class_Abstract {

    /**
     * @param CM_Params $params
     * @return mixed
     */
    abstract protected function _execute(CM_Params $params);

    /**
     * @param CM_Params $params
     * @return mixed
     * @throws Exception
     */
    private function _executeJob(CM_Params $params) {
        CMService_Newrelic::getInstance()->startTransaction('CM Job: ' . $this->_getClassName());
        try {
            $return = $this->_execute($params);
            CMService_Newrelic::getInstance()->endTransaction();
            return $return;
        } catch (Exception $ex) {
            CMService_Newrelic::getInstance()->endTransaction();
            throw $ex;
        }
    }

    /**
     * @param array|null $params
     * @throws CM_Exception
     * @return mixed
     */
    final public function run(array $params = null) {
        if (null === $params) {
            $params = array();
        }
        if (!$this->_getGearmanEnabled()) {
            return $this->_executeJob(CM_Params::factory($params));
        }

        $workload = CM_Params::encode($params, true);
        $gearmanClient = $this->_getGearmanClient();
        $result = $gearmanClient->doNormal($this->_getJobName(), $workload);
        if ($gearmanClient->returnCode() === GEARMAN_WORK_FAIL) {
            throw new CM_Exception('Job `' . $this->_getJobName() . '` failed.');
        }
        return CM_Params::decode($result, true);
    }


    /**
     * @param array|null $params
     */
    final public function queue(array $params = null) {
        if (null === $params) {
            $params = array();
        }
        if (!$this->_getGearmanEnabled()) {
            $this->_executeJob(CM_Params::factory($params));
            return;
        }

        $workload = CM_Params::encode($params, true);
        $gearmanClient = $this->_getGearmanClient();
        $gearmanClient->doBackground($this->_getJobName(), $workload);
    }

    /**
     * @param GearmanJob $job
     * @return string|null
     * @throws CM_Exception_Nonexistent
     */
    final public function __executeGearman(GearmanJob $job) {
        $workload = $job->workload();
        try {
            $params = CM_Params::factory(CM_Params::decode($workload, true));
        } catch (CM_Exception_Nonexistent $ex) {
            throw new CM_Exception_Nonexistent(
                'Cannot decode workload for Job `' . get_class($this) . '`: Original exception message `' . $ex->getMessage() .
                '`', null, null, CM_Exception::WARN);
        }
        return CM_Params::encode($this->_executeJob($params), true);
    }

    /**
     * @return string
     */
    final protected function _getJobName() {
        return get_class($this);
    }

    /**
     * @return boolean
     */
    final private function _getGearmanEnabled() {
        return (boolean) self::_getConfig()->gearmanEnabled;
    }

    /**
     * @return GearmanClient
     * @throws CM_Exception
     */
    protected function _getGearmanClient() {
        if (!extension_loaded('gearman')) {
            throw new CM_Exception('Missing `gearman` extension');
        }
        $config = static::_getConfig();
        $gearmanClient = new GearmanClient();
        foreach ($config->servers as $server) {
            $gearmanClient->addServer($server['host'], $server['port']);
        }
        return $gearmanClient;
    }
}
