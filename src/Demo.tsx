import * as React from 'react';
import { clickCounted, InjectedProps } from './ClickCounted';

interface DemoProps {
    text: string;
}

const DemoComponent = (props: DemoProps & InjectedProps): JSX.Element => {
    return (
        <div>
            <p>{props.text}</p>
            <p>
                {
                    props.clickCount >= 5
                        ? 'Easy there!'
                        : 'Bring it!'
                }
            </p>
        </div>
    );
};

export const Demo = clickCounted()(DemoComponent);
