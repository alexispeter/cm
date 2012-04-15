<?php
require_once __DIR__ . '/../../TestCase.php';

class CM_UsertextTest extends TestCase {

	private $_text = <<<EOD
smilies: :-)
allowed tags: <b attr="not-allowed" class="italic">bold</b>
un-allowed tags: <foo>foo</foo> <big-grin> Lorem ipsum <averylongunallowedtag>hiho</averylongunallowedtag>
badwords: hallo@yahoo.com
special chars: "<>"
unclosed tags: <u>not <b>closed
EOD;

	public static function setUpBeforeClass() {
		CM_Mysql::insert(TBL_CM_LANG, array('abbrev' => 'EN', 'label' => 'English', 'enabled' => 1)); // For censoring

		$badwords = new CM_Paging_ContentList_Badwords();
		$badwords->add('@yahoo.com');

		$setId = CM_Mysql::insert(TBL_CM_SMILEYSET, array('label' => 'testSet'));
		CM_Mysql::insert(TBL_CM_SMILEY, array('setId' => $setId, 'code' => ':),:-)', 'file' => '1.png'));
		CM_Mysql::insert(TBL_CM_SMILEY, array('setId' => $setId, 'code' => ';)', 'file' => '2.png'));
		CM_Mysql::insert(TBL_CM_SMILEY, array('setId' => $setId, 'code' => ':(,:-(', 'file' => '3.png'));
		CM_Mysql::insert(TBL_CM_SMILEY, array('setId' => $setId, 'code' => '*PLAYMATE*', 'file' => '4.png'));
		CM_Mysql::insert(TBL_CM_SMILEY, array('setId' => $setId, 'code' => '<3', 'file' => '5.png'));

		TH::clearCache();
	}

	public static function tearDownAfterClass() {
		TH::clearEnv();
	}

	public function testFormat() {
		$splitChar = CM_Usertext::getSplitChar();
		$urlStatic = URL_STATIC;
		$modified = CM_App::getInstance()->getReleaseStamp();
		$expected = <<<EOD
smilies: <img class="smile" alt=":)" title=":)" src="{$urlStatic}img/smiles/1/1.png?{$modified}" /><br />
allowed tags: <b class="italic">bold</b><br />
un-allowed tags: &lt;foo&gt;{$splitChar}foo&lt;/foo&gt; &lt;big-grin&gt; Lorem ipsum &lt;aver{$splitChar}ylongunall{$splitChar}owedtag&gt;hi{$splitChar}ho&lt;/averyl{$splitChar}ongunallow{$splitChar}edtag&gt;<br />
badwords: hallo​badword_re​placement<br />
special chars: &quot;&lt;&gt;&quot;<br />
unclosed tags: <u>not <b>closed</b></u>
EOD;
		$actual = new CM_Usertext($this->_text);
		$this->assertEquals($expected, $actual->getFormat());
	}

	public function testBadwords() {
		$badwords = new CM_Paging_ContentList_Badwords();
		$badwords->add('@yahoo.com');

		$actual = new CM_Usertext('hallo@yahoo.com world');
		$this->assertEquals('hallo​badword_re​placement world', $actual->getFormat());
	}

	public function testFormatPlain() {
		$splitChar = CM_Usertext::getSplitChar();
		$urlStatic = URL_STATIC;
		$modified = CM_App::getInstance()->getReleaseStamp();
		$expected = <<<EOD
smilies: <img class="smile" alt=":)" title=":)" src="{$urlStatic}img/smiles/1/1.png?{$modified}" />
allowed tags: bold
un-allowed tags: &lt;foo&gt;{$splitChar}foo&lt;/foo&gt; &lt;big-grin&gt; Lorem ipsum &lt;aver{$splitChar}ylongunall{$splitChar}owedtag&gt;hi{$splitChar}ho&lt;/averyl{$splitChar}ongunallow{$splitChar}edtag&gt;
badwords: hallo​badword_re​placement
special chars: &quot;&lt;&gt;&quot;
unclosed tags: not closed
EOD;
		$actual = new CM_Usertext($this->_text);
		$this->assertEquals($expected, $actual->getFormatPlain());
	}

	public function testPlain() {
		$splitChar = CM_Usertext::getSplitChar();
		$expected = <<<EOD
smilies: :-)
allowed tags: &lt;b attr=&quot;not-allowed&quot; class{$splitChar}=&quot;italic&quot;&gt;{$splitChar}bold&lt;/b&gt;
un-allowed tags: &lt;foo&gt;{$splitChar}foo&lt;/foo&gt; &lt;big-grin&gt; Lorem ipsum &lt;aver{$splitChar}ylongunall{$splitChar}owedtag&gt;hi{$splitChar}ho&lt;/averyl{$splitChar}ongunallow{$splitChar}edtag&gt;
badwords: hallo​badword_re​placement
special chars: &quot;&lt;&gt;&quot;
unclosed tags: &lt;u&gt;not &lt;b&gt;closed
EOD;
		$actual = new CM_Usertext($this->_text);
		$this->assertEquals($expected, $actual->getPlain());
	}

	public function testPlainTruncate() {
		$actual = new CM_Usertext('Hello World');
		$this->assertEquals('Hello…', $actual->getPlain(10));
		$this->assertEquals('Hello World', $actual->getPlain(11));
		$this->assertEquals('Hello World', $actual->getPlain(12));
	}

	public function testFormatPlainTruncate() {
		$urlStatic = URL_STATIC;
		$modified = CM_App::getInstance()->getReleaseStamp();
		$actual = new CM_Usertext('Ein Gespenst <b>geht</b> um in Europa :) test');
		$expectedEmoticon = '<img class="smile" alt=":)" title=":)" src="' . $urlStatic . 'img/smiles/1/1.png?' . $modified . '" />';

		$this->assertEquals('Ein Gespenst geht um in Europa ' . $expectedEmoticon . ' test', $actual->getFormatPlain(1000));
		$this->assertEquals('Ein Gespenst geht um in…', $actual->getFormatPlain(29));
		$this->assertEquals('Ein Gespenst geht um in Europa …', $actual->getFormatPlain(31));
		$this->assertEquals('Ein Gespenst geht um in Europa ' . $expectedEmoticon . '…', $actual->getFormatPlain(32));
		$this->assertEquals('Ein Gespenst geht um in Europa ' . $expectedEmoticon . '…', $actual->getFormatPlain(33));
		$this->assertEquals('Ein Gespenst geht um in Europa ' . $expectedEmoticon . ' test', $actual->getFormatPlain(37));
		$this->assertEquals('Ein Gespenst ge…', $actual->getFormatPlain(15));
		$this->assertEquals('Ein Gespenst geht um in…', $actual->getFormatPlain(25));
	}

	public function testFormatPlainTruncateSmiley() {
		$urlStatic = URL_STATIC;
		$modified = CM_App::getInstance()->getReleaseStamp();
		$actual = new CM_Usertext('Yo *PLAYMATE*');

		$expected = 'Yo <img class="smile" alt="*PLAYMATE*" title="*PLAYMATE*" src="' . $urlStatic . 'img/smiles/1/4.png?' . $modified . '" />';
		$this->assertEquals($expected, $actual->getFormatPlain(1000));
		$this->assertEquals($expected, $actual->getFormatPlain(4));
		$this->assertEquals('Yo ', $actual->getFormatPlain(3));
		$this->assertEquals('Yo…', $actual->getFormatPlain(2));
		$this->assertEquals('Y…', $actual->getFormatPlain(1));
	}

	public function testFormatTruncate() {
		$actual = new CM_Usertext('Anybody <u>in</u> there?');

		$this->assertEquals('Anybody <u>in</u> there?', $actual->getFormat(17));
		$this->assertEquals('Anybody <u>in</u>…', $actual->getFormat(16));
		$this->assertEquals('Anybody <u>in</u>…', $actual->getFormat(10));
		$this->assertEquals('Anybody <u>i</u>…', $actual->getFormat(9));
		$this->assertEquals('Anybody …', $actual->getFormat(8));
		$this->assertEquals('Anybody…', $actual->getFormat(7));
	}

	public function testFormatUnallowedTagsFiltering() {
		$urlStatic = URL_STATIC;
		$modified = CM_App::getInstance()->getReleaseStamp();
		$expected =
				'<img class="smile" alt="&lt;3" title="&lt;3" src="' . $urlStatic . 'img/smiles/1/5.png?' . $modified . '" /> love<br />' . PHP_EOL .
						'you';

		$actual = new CM_Usertext('<3 love' . PHP_EOL . 'you');
		$this->assertEquals($expected, $actual->getFormat());
	}

	public function testFormatAllowedTags() {
		$actual = new CM_Usertext('<b>hello</b> <u>test</u>');
		$this->assertEquals('<b>hello</b> <u>test</u>', $actual->getFormat());
		$this->assertEquals('<b>hello</b> &lt;u&gt;te​st&lt;/u&gt;', $actual->getFormat(null, array('b')));
		$this->assertEquals('&lt;b&gt;he​llo&lt;/b&gt; &lt;u&gt;te​st&lt;/u&gt;', $actual->getFormat(null, array()));
	}

	public function testFormatVisibleTags() {
		$actual = new CM_Usertext('<b>hello</b> <u>test</u>');
		$this->assertEquals('<b>hello</b> <u>test</u>', $actual->getFormat(null, array('b', 'u')));
		$this->assertEquals('<b>hello</b> test', $actual->getFormat(null, array('b', 'u'), array('b')));
	}

	public function testMultibyte() {
		$expected = '繁體字';
		$actual = new CM_Usertext('繁體字');
		$this->assertEquals($expected, $actual->getPlain());
		$this->assertEquals($expected, $actual->getFormat());
		$this->assertEquals($expected, $actual->getFormatPlain());
	}

	public function testTagEmpty() {
		$expected = '<u></u>';
		$actual = new CM_Usertext('<u></u>');
		$this->assertEquals($expected, $actual->getFormat());

		$expected = '<br />';
		$actual = new CM_Usertext('<br></br>');
		$this->assertEquals($expected, $actual->getFormat());

		$expected = '<br />test';
		$actual = new CM_Usertext('<br>test</br>');
		$this->assertEquals($expected, $actual->getFormat());
	}

	public function testNewlines() {
		$actual = new CM_Usertext("a\n\n\n\nb\nc\n");
		$this->assertEquals("a<br /><br /><br />\nb<br />\nc", $actual->getFormat());
	}
}
