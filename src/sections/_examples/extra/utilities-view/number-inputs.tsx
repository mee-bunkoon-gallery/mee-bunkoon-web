import { useState } from 'react';
import { RiInformationFill } from '@remixicon/react';

import { NumberInput } from 'src/components/number-input';

import { ComponentBox } from '../../layout';

// ----------------------------------------------------------------------

export function NumberInputs() {
  const [value1, setValue1] = useState<number | null>(null);
  const [value2, setValue2] = useState<number | undefined>(0);

  return (
    <>
      <ComponentBox title="Basic">
        <NumberInput
          value={value1}
          onChange={(event, newValue) => setValue1(newValue)}
          sx={{ maxWidth: 120 }}
        />
      </ComponentBox>

      <ComponentBox title="With helper text">
        <NumberInput
          hideDivider
          value={value2}
          onChange={(event, newValue) => setValue2(newValue)}
          max={999999}
          captionText={
            <>
              <RiInformationFill size={16} />
              Bedrooms
            </>
          }
          helperText="Helper text"
          slotProps={{
            captionText: { sx: { color: 'text.primary' } },
            button: { disableRipple: true },
          }}
        />
      </ComponentBox>

      <ComponentBox title="Disabled">
        <NumberInput
          disabled
          hideDivider
          captionText={
            <>
              <RiInformationFill size={16} />
              Bedrooms
            </>
          }
        />
      </ComponentBox>
    </>
  );
}
