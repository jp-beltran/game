import { render } from "@testing-library/react";

import { describe } from 'node:test';

describe("PromptConsole", () => {
  it("adds a spin class to the loading icon while submitting", () => {
    const { container } = render(
      <PromptConsole
        input="Implementar inventario"
        messages={[]}
        onCancel={vi.fn()}
        onInputChange={vi.fn()}
        onSubmit={vi.fn()}
        status="submitting"
        statusMessage=""
        thinkingMessage={null}
      />,
    );

    expect(container.querySelector(".button .icon-spin")).toBeInTheDocument();
  });
});
