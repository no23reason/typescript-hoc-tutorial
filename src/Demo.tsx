import * as React from 'react';
import { clickCounted, InjectedProps } from './ClickCounted';

interface DemoProps {
    text: string;
}

const DemoComponent = (props: DemoProps & InjectedProps): JSX.Element => {
    return (
        <div>
            {props.text}
            {
                props.clickCount > 5
                    ? 'Easy there!'
                    : 'Bring it!'
            }
        </div>
    );
};

export const Demo = clickCounted(true)(DemoComponent);
