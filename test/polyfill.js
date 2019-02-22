describe('Intl.PluralRules polyfill', function(){
    it('should exist', function(){
        expect(Intl.PluralRules).to.be.a('function');
    });
    describe('.supportedLocalesOf()', function(){
        it('should be executable', function(){
            expect(Intl.PluralRules.supportedLocalesOf).to.not.throwException(console.log);
        });
        it('should return an empty array when called with no args', function(){
            var res = Intl.PluralRules.supportedLocalesOf();
            expect(res).to.be.an('array');
            expect(res).to.be.empty();
        });
        it('should return a valid array', function(){
            var res = Intl.PluralRules.supportedLocalesOf(['en', 'fi-FI']);
            expect(res).to.be.an('array');
            expect(res).to.have.length(2);
            expect(res[0]).to.equal('en');
            expect(res[1]).to.equal('fi-FI');
        });
    });

    describe('constructor', function(){
        it('should require `new`', function(){
            expect(Intl.PluralRules).to.throwException(function(e){
                expect(e).to.be.a(TypeError);
            });
            var fn = function(){ new Intl.PluralRules(); };
            expect(fn).to.not.throwException(console.log);
        });
        it('should select a default type & locale', function(){
            var p = new Intl.PluralRules();
            expect(p).to.be.an('object');
            expect(p.select).to.be.a('function');
            var opt = p.resolvedOptions()
            expect(opt.type).to.equal('cardinal');
            expect(opt.locale).to.be.a('string');
            expect(opt.locale.length).to.be.greaterThan(1);
        });
        it('should handle valid simple arguments correctly', function(){
            var p = new Intl.PluralRules('fi-FI', { type: 'ordinal' });
            expect(p).to.be.an('object');
            expect(p.select).to.be.a('function');
            var opt = p.resolvedOptions()
            expect(opt.type).to.equal('ordinal');
            expect(opt.locale).to.match(/^fi\b/);
        });
        it('should choose a locale correctly from multiple choices', function(){
            var p = new Intl.PluralRules(['i-klingon', 'ak', 'en']);
            expect(p).to.be.an('object');
            expect(p.select).to.be.a('function');
            var opt = p.resolvedOptions()
            expect(opt.type).to.equal('cardinal');
            expect(opt.locale).to.equal('ak');
        });
        it('should complain about invalid types', function(){
            var fn = function(){ new Intl.PluralRules('en', { type: 'invalid' }); };
            expect(fn).to.throwException(function(e){
                expect(e).to.be.a(RangeError);
            });
        });
    });

    describe('#resolvedOptions()', function(){
        it('should exist', function(){
            var p = new Intl.PluralRules();
            expect(p.resolvedOptions).to.be.a('function');
        });
        it('should return expected values', function(){
            var p = new Intl.PluralRules('fi-FI'), res = p.resolvedOptions();
            expect(res).to.be.an('object');
            expect(res.locale).to.match(/^fi\b/);
            expect(res.pluralCategories).to.eql(['one', 'other']);
            expect(res.type).to.equal('cardinal');
        });
    });

    describe('#select()', function(){
        it('should return a string', function(){
            var p = new Intl.PluralRules(), res = p.select();
            expect(res).to.be.a('string');
            expect(res).to.equal('other');
        });
        it('should work for English cardinals', function(){
            var p = new Intl.PluralRules('en', { type: 'cardinal' });
            expect(p.select(1)).to.equal('one');
            //expect(p.select('1.0')).to.equal('other');
            expect(p.select(2)).to.equal('other');
            //expect(p.select('-2.0')).to.equal('other');
        });
        it('should work for English ordinals', function(){
            var p = new Intl.PluralRules('en', { type: 'ordinal' });
            expect(p.select(1)).to.equal('one');
            expect(p.select('22')).to.equal('two');
            expect(p.select('3.0')).to.equal('few');
            expect(p.select(11)).to.equal('other');
        });
    });
});
