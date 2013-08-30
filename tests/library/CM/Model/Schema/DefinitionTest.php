<?php

class CM_Model_Schema_DefinitionTest extends CMTest_TestCase {

	public function testHasKey() {
		$schema = new  CM_Model_Schema_Definition(array(
			'foo' => array(),
			'bar' => array(),
		));

		$this->assertTrue($schema->hasField('foo'));
		$this->assertTrue($schema->hasField(array('foo', 'xxxx')));
		$this->assertFalse($schema->hasField('xxxxx'));
		$this->assertFalse($schema->hasField(array('xxxx', 'yyyyy')));
	}

	public function testGetFieldNames() {
		$schema = new  CM_Model_Schema_Definition(array(
			'foo' => array(),
			'bar' => array(),
		));

		$this->assertSame(array('foo', 'bar'), $schema->getFieldNames());
	}

	public function testValidateField() {
		$testDataList = array(
			// nothing
			array(
				'value'       => 12,
				'schema'      => array(),
				'expected'    => true,
			),
			array(
				'value'    => null,
				'schema'   => array(),
				'expected' => 'CM_Model_Exception_Validation',
			),

			// optional
			array(
				'value'       => null,
				'schema'      => array('optional' => true),
				'expected'    => true,
			),

			// type integer
			array(
				'value'       => -12,
				'schema'      => array('type' => 'integer'),
				'expected'    => true,
			),
			array(
				'value'       => '-12',
				'schema'      => array('type' => 'integer'),
				'expected'    => true,
			),
			array(
				'value'    => 12.01,
				'schema'   => array('type' => 'integer'),
				'expected' => 'CM_Model_Exception_Validation',
			),
			array(
				'value'    => '12abc',
				'schema'   => array('type' => 'integer'),
				'expected' => 'CM_Model_Exception_Validation',
			),
			array(
				'value'       => 14,
				'schema'      => array('type' => 'int'),
				'expected'    => true,
			),

			// type string
			array(
				'value'       => 'foo bar',
				'schema'      => array('type' => 'string'),
				'expected'    => true,
			),
			array(
				'value'       => 'foo 繁體字 bar',
				'schema'      => array('type' => 'string'),
				'expected'    => true,
			),
			array(
				'value'       => '',
				'schema'      => array('type' => 'string'),
				'expected'    => true,
			),
			array(
				'value'    => 12,
				'schema'   => array('type' => 'string'),
				'expected' => 'CM_Model_Exception_Validation',
			),

			// type float
			array(
				'value'       => -12,
				'schema'      => array('type' => 'float'),
				'expected'    => true,
			),
			array(
				'value'       => '-123',
				'schema'      => array('type' => 'float'),
				'expected'    => true,
			),
			array(
				'value'       => 12.01,
				'schema'      => array('type' => 'float'),
				'expected'    => true,
			),
			array(
				'value'       => '12.01',
				'schema'      => array('type' => 'float'),
				'expected'    => true,
			),
			array(
				'value'    => '12abc',
				'schema'   => array('type' => 'float'),
				'expected' => 'CM_Model_Exception_Validation',
			),

			// type boolean
			array(
				'value'       => true,
				'schema'      => array('type' => 'boolean'),
				'expected'    => true,
			),
			array(
				'value'       => false,
				'schema'      => array('type' => 'boolean'),
				'expected'    => true,
			),
			array(
				'value'       => '1',
				'schema'      => array('type' => 'boolean'),
				'expected'    => true,
			),
			array(
				'value'       => '0',
				'schema'      => array('type' => 'boolean'),
				'expected'    => true,
			),
			array(
				'value'    => 1,
				'schema'   => array('type' => 'boolean'),
				'expected' => 'CM_Model_Exception_Validation',
			),
			array(
				'value'    => 'true',
				'schema'   => array('type' => 'boolean'),
				'expected' => 'CM_Model_Exception_Validation',
			),
			array(
				'value'    => '00',
				'schema'   => array('type' => 'boolean'),
				'expected' => 'CM_Model_Exception_Validation',
			),
			array(
				'value'       => true,
				'schema'      => array('type' => 'bool'),
				'expected'    => true,
			),

			// type array
			array(
				'value'       => array('foo' => 'bar'),
				'schema'      => array('type' => 'array'),
				'expected'    => true,
			),
			array(
				'value'       => '123',
				'schema'      => array('type' => 'array'),
				'expected'    => 'CM_Model_Exception_Validation',
			),

			// type model
			array(
				'value'       => '{"id": 3}',
				'schema'      => array('type' => 'CM_Model_Mock_Validation'),
				'expected'    => true,
			),
			array(
				'value'       => '3',
				'schema'      => array('type' => 'CM_Model_Mock_Validation'),
				'expected'    => true,
			),
			array(
				'value'       => '{"id": 4, "foo": "bar"}',
				'schema'      => array('type' => 'CM_Model_Mock_Validation'),
				'expected'    => true,
			),
			array(
				'value'       => '{"bar": 4, "foo": "bar"}',
				'schema'      => array('type' => 'CM_Model_Mock_Validation'),
				'expected'    => 'CM_Model_Exception_Validation',
			),


			// type invalid
			array(
				'value'    => -12,
				'schema'   => array('type' => 'invalid987628436'),
				'expected' => 'CM_Exception_Invalid',
			),
		);
		foreach ($testDataList as $testData) {
			$schema = new CM_Model_Schema_Definition(array('foo' => $testData['schema']));
			try {
				$schema->validateField('foo', $testData['value']);
				$this->assertSame($testData['expected'], true, 'Validation failure (' . CM_Util::var_line($testData) . ')');
			} catch (CM_Exception $e) {
				$this->assertSame($testData['expected'], get_class($e), 'Validation failure (' . CM_Util::var_line($testData) . ')');
			}
		}
	}

	public function testValidateObjectField() {
		$id = 1;
		CM_Config::get()->CM_Model_Abstract->types[CM_Model_Mock_Validation::TYPE] = 'CM_Model_Mock_Validation';

		$schema = new CM_Model_Schema_Definition(array('model' => array('type' => 'CM_Model_Mock_Validation')));
		$value = $schema->validateField('model', $id);

		$this->assertEquals(new CM_Model_Mock_Validation($id), $value);
	}

	public function testValidateFieldIdRaw() {
		$id = 1;
		$idRaw = array('id' => $id, 'foo' => 'bar');
		$idRawSerialized = CM_Params::encode($idRaw, true);
		CM_Config::get()->CM_Model_Abstract->types[CM_Model_Mock_Validation::TYPE] = 'CM_Model_Mock_Validation';

		$schema = new CM_Model_Schema_Definition(array('model' => array('type' => 'CM_Model_Mock_Validation')));
		$value = $schema->validateField('model', $idRawSerialized);

		$this->assertEquals(new CM_Model_Mock_Validation($id, 'bar'), $value);
	}

	/**
	 * @expectedException CM_Exception_Invalid
	 * @expectedExceptionMessage Invalid type `CM_Class_Abstract`
	 */
	public function testValidateFieldInvalidClass() {
		$schema = new CM_Model_Schema_Definition(array('model' => array('type' => 'CM_Class_Abstract')));
		$schema->validateField('model', 1);
	}

}

class CM_Model_Mock_Validation extends CM_Model_Abstract {

	const TYPE = 1;

	public function __construct($id, $foo = null) {
		$id = array('id' => (int) $id);
		if (null !== $foo) {
			$id['foo'] = $foo;
		}
		$this->_construct($id);
	}

	protected function _loadData() {
		return array('id' => $this->getId());
	}
}
