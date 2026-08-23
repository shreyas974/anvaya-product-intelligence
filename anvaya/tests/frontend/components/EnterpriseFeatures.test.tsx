import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EvidenceDrawer } from '@/components/common/EvidenceDrawer';
import { ContentStudio } from '@/pages/Products/ContentStudio';
import { CommandPalette } from '@/components/common/CommandPalette';

describe('EvidenceDrawer Component', () => {
  it('renders nothing when closed or no record provided', () => {
    const { container } = render(
      <EvidenceDrawer isOpen={false} onClose={() => {}} record={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders field details and confidence badge when opened', () => {
    const mockRecord = {
      field_name: 'Brand',
      value: 'Diablo',
      source: 'Part_Desc',
      evidence: "Matched recognized brand token 'diablo'",
      method: 'brand_dictionary_matcher',
      confidence: 0.95,
    };

    render(
      <EvidenceDrawer
        isOpen={true}
        onClose={() => {}}
        record={mockRecord}
        productMpn="DCB518ASTS06G"
      />
    );

    expect(screen.getByText('Decision Evidence Inspector')).toBeDefined();
    expect(screen.getByText('SKU: DCB518ASTS06G')).toBeDefined();
    expect(screen.getByText('Diablo')).toBeDefined();
    expect(screen.getByText('95% Confidence')).toBeDefined();
    expect(screen.getByText('Part_Desc')).toBeDefined();
  });

  it('triggers accept and reject callbacks', () => {
    const handleAccept = vi.fn();
    const handleReject = vi.fn();
    const mockRecord = {
      field_name: 'Dimensions',
      value: '1/2 in x 18 in',
      source: 'Part_Desc',
      method: 'regex_dimension_normalizer',
      confidence: 0.96,
    };

    render(
      <EvidenceDrawer
        isOpen={true}
        onClose={() => {}}
        record={mockRecord}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    );

    const acceptBtn = screen.getByText('Accept Fact');
    fireEvent.click(acceptBtn);
    expect(handleAccept).toHaveBeenCalledWith(mockRecord);

    const flagBtn = screen.getByText('Flag Review');
    fireEvent.click(flagBtn);
    expect(handleReject).toHaveBeenCalledWith(mockRecord);
  });
});

describe('ContentStudio Component', () => {
  it('renders all multi-channel content cards with character caps', () => {
    render(<ContentStudio productMpn="PDSH4816AF" />);
    expect(screen.getByText('Multi-Channel Product Content Studio')).toBeDefined();
    expect(screen.getByText('Invoice Description')).toBeDefined();
    expect(screen.getByText('Mobile Description')).toBeDefined();
    expect(screen.getByText('Short Description')).toBeDefined();
    expect(screen.getByText('Long Technical Description')).toBeDefined();
    expect(screen.getByText('Retail Display Description')).toBeDefined();
  });
});
