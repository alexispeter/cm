<?php

class CM_PagingSource_MongoDb extends CM_PagingSource_Abstract {

    private $_fields, $_collection, $_query;

    /**
     * @param  array|null $fields Array of field which to include/exclude, see http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
     * @param  string     $collection
     * @param  array|null $query
     */
    public function __construct($fields, $collection, $query = null) {
        $this->_fields = (array) $fields;
        $this->_collection = (string) $collection;
        $this->_query = (array) $query;
    }

    /**
     * @param int|null $offset
     * @param int|null $count
     * @return int
     */
    public function getCount($offset = null, $count = null) {
        $cacheKey = array('count');
        if (($count = $this->_cacheGet($cacheKey)) === false) {
            $mongoDb = CM_Services::getInstance()->getMongoDb();
            $count = $mongoDb->count($this->_collection, $this->_query, $count, $offset);;
            $this->_cacheSet($cacheKey, $count);
        }
        return $count;
    }

    /**
     * @param int|null $offset
     * @param int|null $count
     * @return array
     */
    public function getItems($offset = null, $count = null) {
        $cacheKey = array('items', $offset, $count);
        if (($items = $this->_cacheGet($cacheKey)) === false) {
            $mongoDb = CM_Services::getInstance()->getMongoDb();

            $cursor = $mongoDb->find($this->_collection, $this->_query, $this->_fields);

            if (null !== $offset) {
                $cursor->skip($offset);
            }

            if (null !== $count) {
                $cursor->limit($count);
            }

            $items = array();
            foreach ($cursor as $item) {
                $items[] = $item;
            }
            $this->_cacheSet($cacheKey, $items);
        }

        return $items;
    }

    protected function _cacheKeyBase() {
        return array($this->_fields, $this->_collection, $this->_query);
    }

    function getStalenessChance() {
        return 0.01;
    }
}
