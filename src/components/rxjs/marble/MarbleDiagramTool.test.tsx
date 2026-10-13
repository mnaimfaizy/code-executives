import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarbleDiagramTool } from './MarbleDiagramTool';

const textBox = () => screen.getByRole('textbox', { name: /input stream/i });
const inputDiagram = () => screen.getByRole('img', { name: /^Input stream:/ });
const outputDiagram = () => screen.getByRole('img', { name: /^Output stream:/ });

const addOperator = async (
  user: ReturnType<typeof userEvent.setup>,
  operator: string,
  settings: { choice?: [label: RegExp, option: string]; count?: [label: RegExp, value: string] }
) => {
  await user.selectOptions(screen.getByRole('combobox', { name: /add an operator/i }), operator);
  if (settings.choice) {
    await user.selectOptions(
      screen.getByRole('combobox', { name: settings.choice[0] }),
      settings.choice[1]
    );
  }
  if (settings.count) {
    const box = screen.getByRole('spinbutton', { name: settings.count[0] });
    await user.clear(box);
    await user.type(box, settings.count[1]);
  }
  await user.click(screen.getByRole('button', { name: 'Add Operator' }));
};

describe('MarbleDiagramTool', () => {
  it('draws the starting stream', () => {
    render(<MarbleDiagramTool />);

    expect(textBox()).toHaveValue('--a--b--c--|');
    expect(inputDiagram()).toHaveAccessibleName(
      'Input stream: a at 20ms, b at 50ms, c at 80ms, completes at 110ms'
    );
  });

  it('typing updates the text box and the diagram', async () => {
    const user = userEvent.setup();
    render(<MarbleDiagramTool />);

    await user.clear(textBox());
    await user.type(textBox(), '-x-y|');

    expect(textBox()).toHaveValue('-x-y|');
    expect(inputDiagram()).toHaveAccessibleName(
      'Input stream: x at 10ms, y at 30ms, completes at 40ms'
    );
    expect(outputDiagram()).toHaveAccessibleName(
      'Output stream: x at 10ms, y at 30ms, completes at 40ms'
    );
  });

  it('a quick template updates the text box and the diagram', async () => {
    const user = userEvent.setup();
    render(<MarbleDiagramTool />);

    await user.click(screen.getByRole('button', { name: 'withError' }));

    expect(textBox()).toHaveValue('--a--b--#');
    expect(inputDiagram()).toHaveAccessibleName(
      'Input stream: a at 20ms, b at 50ms, error at 80ms'
    );
  });

  it('an example updates the text box, the chain and the diagram', async () => {
    const user = userEvent.setup();
    render(<MarbleDiagramTool />);

    await user.click(screen.getByRole('button', { name: 'Advanced Example' }));

    expect(textBox()).toHaveValue('--a--b--c--d--e--|');
    expect(inputDiagram()).toHaveAccessibleName(/^Input stream: a at 20ms, b at 50ms/);
    expect(screen.getByRole('list', { name: /operators/i })).toHaveTextContent(
      'map(to upper case)'
    );
    expect(outputDiagram()).toHaveAccessibleName(/^Output stream: A at 20ms, B at 50ms/);
  });

  it('Clear empties the text box, the chain and the diagram', async () => {
    const user = userEvent.setup();
    render(<MarbleDiagramTool />);
    await user.click(screen.getByRole('button', { name: 'Advanced Example' }));

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(textBox()).toHaveValue('');
    expect(inputDiagram()).toHaveAccessibleName('Input stream: no events');
    expect(outputDiagram()).toHaveAccessibleName('Output stream: no events');
    expect(screen.queryByRole('list', { name: /operators/i })).not.toBeInTheDocument();
  });

  it('offers map as a list of choices, not as text to type', async () => {
    const user = userEvent.setup();
    render(<MarbleDiagramTool />);
    await user.click(screen.getByRole('button', { name: 'Basic Example' }));

    await user.selectOptions(screen.getByRole('combobox', { name: /add an operator/i }), 'map');

    const choices = screen.getByRole('combobox', { name: 'Transformation' });
    expect(within(choices).getAllByRole('option')).toHaveLength(3);
    // The only text box is the marble notation.
    expect(screen.getAllByRole('textbox')).toEqual([textBox()]);

    await user.selectOptions(choices, '× 2');
    await user.click(screen.getByRole('button', { name: 'Add Operator' }));

    expect(outputDiagram()).toHaveAccessibleName(
      'Output stream: 2 at 20ms, 4 at 50ms, 6 at 80ms, completes at 110ms'
    );
  });

  it('does not offer debounceTime', () => {
    render(<MarbleDiagramTool />);

    const operators = screen.getByRole('combobox', { name: /add an operator/i });
    expect(within(operators).queryByRole('option', { name: /debounce/i })).not.toBeInTheDocument();
  });

  it('take(0) stays 0 and the output completes at once', async () => {
    const user = userEvent.setup();
    render(<MarbleDiagramTool />);

    await addOperator(user, 'take', { count: [/values to take/i, '0'] });

    expect(screen.getByRole('list', { name: /operators/i })).toHaveTextContent('take(0)');
    expect(outputDiagram()).toHaveAccessibleName('Output stream: completes at 0ms');
  });

  it('an added operator can be removed again', async () => {
    const user = userEvent.setup();
    render(<MarbleDiagramTool />);
    await addOperator(user, 'skip', { count: [/values to skip/i, '2'] });
    expect(outputDiagram()).toHaveAccessibleName('Output stream: c at 80ms, completes at 110ms');

    await user.click(screen.getByRole('button', { name: 'Remove skip(2)' }));

    expect(screen.queryByRole('list', { name: /operators/i })).not.toBeInTheDocument();
    expect(outputDiagram()).toHaveAccessibleName(
      'Output stream: a at 20ms, b at 50ms, c at 80ms, completes at 110ms'
    );
  });

  it('never calls itself a playground or a code editor', async () => {
    const user = userEvent.setup();
    const { container } = render(<MarbleDiagramTool />);
    await user.selectOptions(screen.getByRole('combobox', { name: /add an operator/i }), 'filter');

    expect(container).not.toHaveTextContent(/playground|code editor|=>/i);
  });
});
