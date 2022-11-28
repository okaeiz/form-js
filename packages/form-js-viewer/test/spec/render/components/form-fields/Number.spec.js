import {
  fireEvent,
  createEvent,
  render
} from '@testing-library/preact/pure';

import Number from '../../../../../src/render/components/form-fields/Number';

import {
  createFormContainer,
  expectNoViolations
} from '../../../../TestHelper';

const spy = sinon.spy;

let container;


describe('Number', function() {

  beforeEach(function() {
    container = createFormContainer();
  });

  afterEach(function() {
    container.remove();
  });


  it('should render', function() {

    // when
    const { container } = createNumberField({
      value: 123
    });

    // then
    const formField = container.querySelector('.fjs-form-field');

    expect(formField).to.exist;
    expect(formField.classList.contains('fjs-form-field-number')).to.be.true;

    const input = container.querySelector('input[type="text"]');

    expect(input).to.exist;
    expect(input.value).to.equal('123');

    const label = container.querySelector('label');

    expect(label).to.exist;
    expect(label.textContent).to.equal('Amount');
  });


  it('should render default value (\'\')', function() {

    // when
    const { container } = createNumberField();

    // then
    const input = container.querySelector('input[type="text"]');

    expect(input).to.exist;
    expect(input.value).to.equal('');
  });


  it('should render <null> value', function() {

    // when
    const { container } = createNumberField({
      value: null
    });

    // then
    const input = container.querySelector('input[type="text"]');

    expect(input).to.exist;
    expect(input.value).to.equal('');
  });


  it('should render default value on value removed', function() {

    // given
    const props = {
      disabled: false,
      errors: [],
      field: defaultField,
      onChange: () => {},
      path: [ defaultField.key ]
    };

    const options = { container: container.querySelector('.fjs-form') };

    const { rerender } = render(<Number { ...props } value={ 123 } />, options);

    // when
    rerender(<Number { ...props } value={ null } />, options);

    // then
    const input = container.querySelector('input[type="text"]');

    expect(input).to.exist;
    expect(input.value).to.equal('');
  });


  it('should render disabled', function() {

    // when
    const { container } = createNumberField({
      disabled: true
    });

    // then
    const input = container.querySelector('input[type="text"]');

    expect(input).to.exist;
    expect(input.disabled).to.be.true;
  });


  it('should render description', function() {

    // when
    const { container } = createNumberField({
      field: {
        ...defaultField,
        description: 'foo'
      }
    });

    // then
    const description = container.querySelector('.fjs-form-field-description');

    expect(description).to.exist;
    expect(description.textContent).to.equal('foo');
  });


  describe('change handling', function() {

    it('should change number', function() {

      // given
      const onChangeSpy = spy();

      const { container } = createNumberField({
        onChange: onChangeSpy,
        value: 123
      });

      // when
      const input = container.querySelector('input[type="text"]');

      fireEvent.input(input, { target: { value: '124' } });

      // then
      expect(onChangeSpy).to.have.been.calledWith({
        field: defaultField,
        value: 124
      });
    });

    it('should clear', function() {

      // given
      const onChangeSpy = spy();

      const { container } = createNumberField({
        onChange: onChangeSpy,
        value: 123
      });

      // when
      const input = container.querySelector('input[type="text"]');

      fireEvent.input(input, { target: { value: '' } });

      // then
      expect(onChangeSpy).to.have.been.calledWith({
        field: defaultField,
        value: null
      });
    });

  });


  describe('formatting', function() {

    it('should handle string inputs as numbers by default', function() {

      // given
      const onChangeSpy = spy();

      const { container } = createNumberField({
        onChange: onChangeSpy,
        value: 123,
      });

      // when
      const input = container.querySelector('input[type="text"]');

      fireEvent.input(input, { target: { value: '124' } });

      // then
      expect(onChangeSpy).to.have.been.calledWith({
        field: defaultField,
        value: 124
      });

    });


    it('should handle number inputs as strings if configured', function() {

      // given
      const onChangeSpy = spy();

      const { container } = createNumberField({
        onChange: onChangeSpy,
        value: 123,
        field: stringField
      });

      // when
      const input = container.querySelector('input[type="text"]');

      fireEvent.input(input, { target: { value: 124 } });

      // then
      expect(onChangeSpy).to.have.been.calledWith({
        field: stringField,
        value: '124'
      });

    });


    it('should handle string inputs as strings if configured', function() {

      // given
      const onChangeSpy = spy();

      const { container } = createNumberField({
        onChange: onChangeSpy,
        value: 123,
        field: stringField
      });

      // when
      const input = container.querySelector('input[type="text"]');

      fireEvent.input(input, { target: { value: '125' } });

      // then
      expect(onChangeSpy).to.have.been.calledWith({
        field: stringField,
        value: '125'
      });

    });


    it('should handle high precision string numbers without trimming', function() {

      // given
      const onChangeSpy = spy();

      const { container } = createNumberField({
        onChange: onChangeSpy,
        value: 123,
        field: stringField
      });

      const highPrecisionStringNumber = '125.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';

      // when
      const input = container.querySelector('input[type="text"]');

      fireEvent.input(input, { target: { value: highPrecisionStringNumber } });

      // then
      expect(onChangeSpy).to.have.been.calledWith({
        field: stringField,
        value: highPrecisionStringNumber
      });

    });


    it('should treat invalid string numbers as "NaN"', function() {

      // given
      const onChangeSpy = spy();

      const { container } = createNumberField({
        onChange: onChangeSpy,
        value: 123,
        field: stringField
      });


      // when
      const input = container.querySelector('input[type="text"]');

      fireEvent.input(input, { target: { value: '12.25a' } });

      // then
      expect(onChangeSpy).to.have.been.calledWith({
        field: stringField,
        value: 'NaN'
      });

    });

  });


  describe('user input', function() {

    it('should prevent key presses generating non-number characters', function() {

      // given
      const { container } = createNumberField({
        value: 123
      });

      const input = container.querySelector('input[type="text"]');

      expect(input).to.exist;
      expect(input.value).to.equal('123');

      const periodKeyPress = createEvent.keyPress(input, { key: '.', code: 'Period' });
      const commaKeyPress = createEvent.keyPress(input, { key: '.', code: 'Comma' });
      const letterKeyPress = createEvent.keyPress(input, { key: 'a', code: 'KeyA' });
      const digitKeyPress = createEvent.keyPress(input, { key: '2', code: 'Digit2' });
      const minusKeyPress = createEvent.keyPress(input, { key: 'a', code: 'KeyA' });

      // when
      fireEvent.focus(input);
      fireEvent(input, periodKeyPress);
      fireEvent(input, commaKeyPress);
      fireEvent(input, letterKeyPress);
      fireEvent(input, digitKeyPress);
      fireEvent(input, minusKeyPress);

      // then
      expect(periodKeyPress.defaultPrevented).to.be.false;
      expect(commaKeyPress.defaultPrevented).to.be.false;
      expect(letterKeyPress.defaultPrevented).to.be.true;
      expect(digitKeyPress.defaultPrevented).to.be.false;
      expect(minusKeyPress.defaultPrevented).to.be.true;

    });


    it('should prevent second comma or period', function() {

      // given
      const { container } = createNumberField({
        value: 123.5
      });

      const input = container.querySelector('input[type="text"]');

      expect(input).to.exist;
      expect(input.value).to.equal('123.5');

      const periodKeyPress = createEvent.keyPress(input, { key: '.', code: 'Period' });
      const commaKeyPress = createEvent.keyPress(input, { key: '.', code: 'Comma' });

      // when
      fireEvent.focus(input);
      fireEvent(input, periodKeyPress);
      fireEvent(input, commaKeyPress);

      // then
      expect(periodKeyPress.defaultPrevented).to.be.true;
      expect(commaKeyPress.defaultPrevented).to.be.true;

    });


    it('should allow a minus at the start', function() {

      // given
      const { container } = createNumberField({
        value: null
      });

      const input = container.querySelector('input[type="text"]');

      expect(input).to.exist;
      expect(input.value).to.equal('');

      const minusKeyPress = createEvent.keyPress(input, { key: '-', code: 'Minus' });

      // when
      fireEvent.focus(input);
      fireEvent(input, minusKeyPress);

      // then
      expect(minusKeyPress.defaultPrevented).to.be.false;

    });

  });


  it('#create', function() {

    // assume
    expect(Number.type).to.eql('number');
    expect(Number.label).to.eql('Number');
    expect(Number.keyed).to.be.true;

    // when
    const field = Number.create();

    // then
    expect(field).to.eql({});

    // but when
    const customField = Number.create({
      custom: true
    });

    // then
    expect(customField).to.contain({
      custom: true
    });
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container } = createNumberField({
        value: 123
      });

      // then
      await expectNoViolations(container);
    });

  });

});

// helpers //////////

const defaultField = {
  key: 'amount',
  label: 'Amount',
  type: 'number',
  description: 'number'
};

const stringField = {
  ...defaultField,
  serializeToString: true
};

function createNumberField(options = {}) {
  const {
    disabled,
    errors,
    field = defaultField,
    onChange,
    path = [ defaultField.key ],
    value
  } = options;

  return render(
    <Number
      disabled={ disabled }
      errors={ errors }
      field={ field }
      onChange={ onChange }
      path={ path }
      value={ value } />,
    {
      container: options.container || container.querySelector('.fjs-form')
    }
  );
}