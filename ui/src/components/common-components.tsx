// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  BreadcrumbGroup,
  Button,
  ButtonDropdown,
  Header,
  SpaceBetween,
  AppLayout, 
  AppLayoutProps
} from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import enMessages from '@cloudscape-design/components/i18n/messages/all.en.json';


export function useAsyncData(loadCallback) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let rendered = true;
    loadCallback().then(items => {
      if (rendered) {
        setItems(items);
        setLoading(false);
      }
    });
    return () => {
      rendered = false;
    };
  }, []);

  return [items, loading];
}

export const Breadcrumbs = ({breadCrumbItems}) => (
  <BreadcrumbGroup items={breadCrumbItems} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

Breadcrumbs.propTypes = {
  breadCrumbItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      href: PropTypes.string
    })
  ).isRequired
};

export const PageHeader = ({ buttons, title }) => {
  return (
    <Header
      variant="h1"
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          {buttons.map((button, key) =>
            !button.items ? (
              <Button href={button.href || ''} disabled={button.disabled || false} key={key} onClick={button.onClick}>
                {button.text}
              </Button>
            ) : (
              <ButtonDropdown items={button.items} key={key}>
                {button.text}
              </ButtonDropdown>
            )
          )}
        </SpaceBetween>
      }
    >
      {title}
    </Header>
  );
};

PageHeader.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      href: PropTypes.string,
      disabled: PropTypes.bool,
      items: PropTypes.array
    })
  ),
  title: PropTypes.string
};

export const CustomAppLayout = forwardRef<AppLayoutProps.Ref>((props, ref) => {
  return (
      <I18nProvider locale="en" messages={[enMessages]}>
      <AppLayout ref={ref} {...props} />
      </I18nProvider>
  );
});

CustomAppLayout.displayName = 'CustomAppLayout';
