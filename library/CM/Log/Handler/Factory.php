<?php

class CM_Log_Handler_Factory implements CM_Service_ManagerAwareInterface {

    use CM_Service_ManagerAwareTrait;

    /**
     * @param string|null $formatMessage
     * @param string|null $formatDate
     * @param int|null    $level
     * @param bool|null   $stopPropagation
     * @return CM_Log_Handler_Stream
     */
    public function createStderrHandler($formatMessage = null, $formatDate = null, $level = null, $stopPropagation = null) {
        $formatMessage = null !== $formatMessage ? (string) $formatMessage : $formatMessage;
        $formatDate = null !== $formatDate ? (string) $formatDate : $formatDate;

        $stream = new CM_OutputStream_Stream_StandardError();
        $formatter = new CM_Log_Formatter_Text($formatMessage, $formatDate);
        return $this->_createStreamHandler($stream, $formatter, $level, $stopPropagation);
    }

    /**
     * @param string      $path
     * @param string|null $formatMessage
     * @param string|null $formatDate
     * @param int|null    $level
     * @param bool|null   $stopPropagation
     * @return CM_Log_Handler_Stream
     */
    public function createFileHandler($path, $formatMessage = null, $formatDate = null, $level = null, $stopPropagation = null) {
        $path = (string) $path;
        $formatMessage = null !== $formatMessage ? (string) $formatMessage : $formatMessage;
        $formatDate = null !== $formatDate ? (string) $formatDate : $formatDate;

        $filesystem = $this->getServiceManager()->getFilesystems()->getData();
        $file = new CM_File($path, $filesystem);
        $stream = new CM_OutputStream_File($file);
        $formatter = new CM_Log_Formatter_Text($formatMessage, $formatDate);
        return $this->_createStreamHandler($stream, $formatter, $level, $stopPropagation);
    }

    /**
     * @param CM_OutputStream_Interface $stream
     * @param CM_Log_Formatter_Abstract $formatter
     * @param int|null                  $level
     * @param bool|null                 $stopPropagation
     * @return CM_Log_Handler_Stream
     */
    protected function _createStreamHandler(CM_OutputStream_Interface $stream, CM_Log_Formatter_Abstract $formatter, $level = null, $stopPropagation = null) {
        $level = null !== $level ? (int) $level : $level;
        $stopPropagation = null !== $stopPropagation ? (bool) $stopPropagation : null;

        return new CM_Log_Handler_Stream($stream, $formatter, $level, $stopPropagation);
    }
}
